"use client";
// https://www.npmjs.com/package/qrcode

import React, { useEffect, useReducer, useRef, useState } from "react";
import parse from "html-react-parser";
import { toString, QRCodeToStringOptions } from "qrcode";
import { auth, db, storage } from "../firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import ProjectButton from "./ProjectButton";
import path from "path";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Spinner from "../spinner/spinner";
import { IoExitOutline } from "react-icons/io5";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export interface Project {
  title: string;
  endPoint: "redirect" | "text" | "image";
  codeId: string;
  content: string;
  settings: QRCodeToStringOptions;
}

enum actionTypes {
  CORRECTION,
  MARGIN,
  CONTENT,
  TITLE,
  ENDPOINT,
  NEW_PROJECT,
  ADD_PROJECT,
  DELETE_PROJECT,
}

const projectReducer = (
  state: Project[],
  action: { type: actionTypes; index: number; payload: any }
): Project[] => {
  switch (action.type) {
    case actionTypes.CORRECTION:
      return state.map((project, index) =>
        index === action.index
          ? {
              ...project,
              settings: {
                ...project.settings,
                errorCorrectionLevel: action.payload,
              },
            }
          : project
      );
    case actionTypes.MARGIN:
      return state.map((project, index) =>
        index === action.index
          ? {
              ...project,
              settings: { ...project.settings, margin: action.payload },
            }
          : project
      );
    case actionTypes.CONTENT:
      return state.map((project, index) =>
        index === action.index
          ? {
              ...project,
              content: action.payload,
            }
          : project
      );
    case actionTypes.TITLE:
      return state.map((project, index) =>
        index === action.index
          ? {
              ...project,
              title: action.payload,
            }
          : project
      );
    case actionTypes.ENDPOINT:
      return state.map((project, index) =>
        index === action.index
          ? {
              ...project,
              endPoint: action.payload,
            }
          : project
      );
    case actionTypes.NEW_PROJECT:
      return [
        ...state,
        {
          title: "New Project",
          endPoint: "redirect",
          codeId: action.payload,
          content: "",
          settings: {
            errorCorrectionLevel: "M",
            margin: 2,
          },
        },
      ];
    case actionTypes.ADD_PROJECT:
      return [...state, action.payload as Project];

    case actionTypes.DELETE_PROJECT:
      return state.filter((_, index) => index !== action.index);
  }

  return state;
};

const Generator = () => {
  const [UUID, setUUID] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [codeData, setCodeData] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [newCodeId, setNewCodeId] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const [projects, updateProjects] = useReducer(projectReducer, []);
  const flag = useRef(false);

  // Display App or redirect user to root
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setAuthenticated(true);
      setUUID(user.uid);
    } else {
      window.location.href = "/";
    }
  });

  // Get projects from database, and set "loading" to false

  useEffect(() => {
    window.innerWidth < 768 ? setIsMobile(true) : setIsMobile(false);
  }, []);

  useEffect(() => {
    const getData = async () => {
      const docs = await getDocs(collection(db, UUID));
      const data = docs.docs.map((doc) => doc.data());

      data.forEach((p, index) => {
        updateProjects({
          type: actionTypes.ADD_PROJECT,
          index: index,
          payload: p,
        });
      });

      setLoading(false);
    };

    if (!flag.current && authenticated) {
      try {
        getData();
      } catch (error) {
        console.error("Getting Data Failed:", error);
        return;
      }
      flag.current = true;
    }
  }, [authenticated]);

  // Update database when projects change
  const updateProjectDocs = async () => {
    try {
      const updatePromises = projects
        .filter((project) => project.codeId)
        .map((project) => setDoc(doc(db, UUID, project.codeId), project));
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to update projects:", error);
    }

    // console.log("updated");
  };

  const debounceUpdateProjectDocs = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      updateProjectDocs();
    }, 1000);
  };

  useEffect(() => {
    debounceUpdateProjectDocs();
  }, [projects]);

  // Generate QR Code
  useEffect(() => {
    let targetUrl = `${window.location.origin}/view/${projects[activeIndex]?.codeId}`;

    if (projects[activeIndex]?.codeId || projects[activeIndex]?.settings) {
      toString(
        targetUrl,
        projects[activeIndex]?.settings,
        function (err: any, url: string) {
          if (err) {
            console.error("Error generating URL:", err);
            return;
          }
          setCodeData(url);
          console.log(targetUrl);
        }
      );
    }
  }, [projects[activeIndex]?.codeId, projects[activeIndex]?.settings]);

  const newProject = async () => {
    // new File
    const docRef = await addDoc(collection(db, UUID), {});
    await setDoc(doc(db, "projects", docRef.id), {
      path: path.join(UUID, "/", docRef.id),
    });

    setNewCodeId(docRef.id);
    setIsNew(true);
    updateProjects({
      type: actionTypes.NEW_PROJECT,
      payload: docRef.id,
      index: 0,
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const storageRef = ref(
          storage,
          `images/${projects[activeIndex].codeId}/${file.name}`
        );
        updateProjects({
          type: actionTypes.CONTENT,
          index: activeIndex,
          payload: `images/${projects[activeIndex].codeId}/${file.name}`,
        });
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        updateProjects({
          type: actionTypes.CONTENT,
          index: activeIndex,
          payload: downloadURL,
        });
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-slate-950 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen w-screen bg-slate-950 ${
        isMobile ? "flex-col" : ""
      }`}
    >
      <div
        className={` bg-slate-800 overflow-scroll ${
          isMobile ? "order-2 w-screen h-36" : "w-60"
        }`}
      >
        {projects.map((project, index) => (
          <ProjectButton
            key={index}
            title={project.title}
            onClick={() => setActiveIndex(index)}
            isActive={index === activeIndex}
            isNew={isNew ? newCodeId === project.codeId : false}
            setOld={() => setIsNew(false)}
            onTitleChanged={(title: string) => {
              //console.log(title);
              updateProjects({
                type: actionTypes.TITLE,
                index,
                payload: title,
              });
            }}
            removeSelf={() => {
              const handleRemoval = async () => {
                try {
                  await deleteDoc(doc(db, UUID, projects[index].codeId));
                  await deleteDoc(doc(db, "projects", projects[index].codeId));
                } catch (error) {
                  console.error("deteting files failed: ", error);
                  return;
                }

                updateProjects({
                  type: actionTypes.DELETE_PROJECT,
                  index: index,
                  payload: null,
                });
                if (index === activeIndex && index === projects.length - 1) {
                  setActiveIndex(index - 1);
                }
              };

              handleRemoval();
            }}
          />
        ))}

        <button
          className="flex items-center justify-center h-10 w-full pl-2 bg-slate-800 hover:bg-slate-900 text-white "
          onClick={newProject}
        >
          New Project
        </button>
      </div>

      <div
        className={`flex items-center justify-center flex-grow ${
          isMobile ? "order-1" : ""
        }`}
      >
        {projects.length !== 0 ? (
          <div className="font-mono">
            <div className="mt-2 mb-2 flex items-center">
              <label className="text-white">Title: </label>
              <input
                type="text"
                className="w-full ml-2"
                onChange={(e) => {
                  updateProjects({
                    type: actionTypes.TITLE,
                    index: activeIndex,
                    payload: e.target.value,
                  });
                }}
                value={projects[activeIndex]?.title ?? ""}
              />
            </div>
            <div className="w-full flex justify-between">
              <label className="text-white">Content type: </label>
              <select
                onChange={(e) =>
                  updateProjects({
                    type: actionTypes.ENDPOINT,
                    index: activeIndex,
                    payload: e.target.value,
                  })
                }
                value={projects[activeIndex]?.endPoint}
              >
                <option value="redirect">Redirect</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
            </div>

            <div className="w-full flex justify-between mt-2">
              <label className="text-white">Error correction: </label>
              <select
                onChange={(e) =>
                  updateProjects({
                    type: actionTypes.CORRECTION,
                    index: activeIndex,
                    payload: e.target.value,
                  })
                }
                value={
                  projects[activeIndex]?.settings?.errorCorrectionLevel ?? "M"
                }
              >
                <option value="L">Low</option>
                <option value="M">Medium</option>
                <option value="Q">Quartile</option>
                <option value="H">High</option>
              </select>
            </div>

            <div className="mt-2 mb-2 flex items-center">
              <label className="text-white">Margin: </label>

              <input
                type="range"
                min="0"
                max="10"
                className="cursor-grab ml-2 accent-blue-600"
                onChange={(e) => {
                  updateProjects({
                    type: actionTypes.MARGIN,
                    index: activeIndex,
                    payload: Number(e.target.value),
                  });
                }}
                value={projects[activeIndex]?.settings?.margin ?? 2}
              />
            </div>
            <div>
              {parse(codeData)}
              {projects[activeIndex].endPoint === "image" ? (
                <>
                  <input
                    type="file"
                    id="myFile"
                    name="filename"
                    onChange={handleFileUpload}
                  />
                </>
              ) : (
                <input
                  type="text"
                  className="w-full outline-none border-b-2 border-l-2 border-r-2 border-gray-700 hover:border-gray-600 focus:border-gray-500 text-sm rounded-b-md block p-2.5 bg-gray-700 text-white"
                  onChange={(e) =>
                    updateProjects({
                      type: actionTypes.CONTENT,
                      index: activeIndex,
                      payload: e.target.value,
                    })
                  }
                  value={projects[activeIndex]?.content}
                  placeholder="https://example.com"
                />
              )}
            </div>
            <button
              className="text-white w-full bg-blue-600 mt-4 p-1 rounded-md"
              onClick={() => {
                const blob = new Blob([codeData], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${projects[activeIndex].title}.svg`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
      <button
        onClick={() => signOut(auth)}
        className="text-white mr-2 font-bold flex items-center justify-center text-2xl absolute top-2 right-2"
      >
        <IoExitOutline />
      </button>
    </div>
  );
};

/*
const Child = React.forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    childMethod() {
      ooo();
    },
  }));

  function ooo() {
    console.log("call me");
  }

  return <></>;
});
*/
export default Generator;
