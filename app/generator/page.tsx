"use client";
// https://www.npmjs.com/package/qrcode

import React, { useEffect, useReducer, useRef, useState } from "react";
import parse from "html-react-parser";
import { toString, QRCodeToStringOptions } from "qrcode";
import { HexColorPicker } from "react-colorful";
import { auth, db } from "../firebase/config";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import ProjectButton from "./ProjectButton";
import path from "path";
import { onAuthStateChanged } from "firebase/auth";
import Spinner from "../spinner/spinner";

const EXAMPLE = "123";

export interface Project {
  title: string;
  endPoint: "redirect" | "text";
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
      console.log(action.payload);
      return [...state, action.payload as Project];
  }

  return state;
};

const Home = () => {
  const [UUID, setUUID] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeData, setCodeData] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [newCodeId, setNewCodeId] = useState("");

  const [projects, updateProjects] = useReducer(projectReducer, []);
  const flag = useRef(false);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setAuthenticated(true);
      setUUID(user.uid);
    } else {
      window.location.href = "/";
    }
  });

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
      getData();
      flag.current = true;
    }
  }, [authenticated]);

  useEffect(() => {
    const updateProjectDocs = async () => {
      try {
        const updatePromises = projects
          .filter((project) => project.codeId)
          .map((project) => setDoc(doc(db, UUID, project.codeId), project));
        await Promise.all(updatePromises);
      } catch (error) {
        console.error("Failed to update projects:", error);
      }
    };

    updateProjectDocs();
  }, [projects]);

  useEffect(() => {
    if (projects[activeIndex]?.codeId || projects[activeIndex]?.settings) {
      toString(
        `http://localhost:3000/view/${
          projects[activeIndex]?.codeId || EXAMPLE
        }`,
        projects[activeIndex]?.settings,
        function (err: any, url: string) {
          if (err) {
            console.error("Error generating URL:", err);
            return;
          }
          console.log(
            `http://localhost:3000/view/${
              projects[activeIndex]?.codeId || EXAMPLE
            }`
          );
          setCodeData(url);
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
    updateProjects({
      type: actionTypes.NEW_PROJECT,
      payload: docRef.id,
      index: 0,
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-slate-950 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950">
      <div className="w-60 bg-slate-800">
        {projects.map((project, index) => (
          <ProjectButton
            key={index}
            title={project.title}
            onClick={() => setActiveIndex(index)}
            isActive={index === activeIndex}
            isNew={newCodeId === project.codeId}
            onTitleChanged={(title: string) => {
              console.log(title);
              updateProjects({
                type: actionTypes.TITLE,
                index,
                payload: title,
              });
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
      <div className="flex items-center justify-center flex-grow">
        <div className="font-mono">
          <div className="w-full flex justify-between">
            <label className="text-white">Endpoint type: </label>
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
              className="cursor-grab ml-2"
              onChange={(e) => {
                updateProjects({
                  type: actionTypes.MARGIN,
                  index: activeIndex,
                  payload: Number(e.target.value),
                });
              }}
            />
          </div>
          <div>
            <QRCodePreview data={codeData} />
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
              value={projects[activeIndex]?.content ?? EXAMPLE}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const QRCodePreview = ({ data }: { data: string }) => {
  return <div>{parse(data)}</div>;
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
export default Home;
