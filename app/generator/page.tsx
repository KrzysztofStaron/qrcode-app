"use client";
// https://www.npmjs.com/package/qrcode

import React, { use, useEffect, useReducer, useRef, useState } from "react";
import parse from "html-react-parser";
import { toString, QRCodeToStringOptions } from "qrcode";
import { HexColorPicker } from "react-colorful";
import { db } from "../firebase/config";
import { addDoc, collection } from "firebase/firestore";
import ProjectButton from "./ProjectButton";

const UUID = "Hello";

const EXAMPLE = "123";

interface Project {
  title: string;
  endPoint: "redirect" | "text" | "image";
  content: string;
  settings: QRCodeToStringOptions;
}

enum actionTypes {
  CORRECTION,
  MARGIN,
  CONTENT,
  TITLE,
  ENDPOINT,
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
  }

  return state;
};

const newProject = async (setqrcodeId: CallableFunction, project: Project) => {
  // new File
  const docRef = await addDoc(collection(db, UUID), {});
  console.log(docRef.id);
  setqrcodeId(docRef.id);
};

const Home = () => {
  const [qrcodeId, setqrcodeId] = useState("");
  const [codeData, setCodeData] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const [projects, updateProjects] = useReducer(projectReducer, [
    {
      title: "",
      endPoint: "redirect",
      content: "",
      settings: {
        type: "svg",
        margin: 1,
        errorCorrectionLevel: "H",
      },
    },
  ]);
  useEffect(() => {
    toString(
      `http://localhost:3000/view/${qrcodeId || EXAMPLE}`,
      projects[activeIndex].settings,
      function (err: any, url: string) {
        setCodeData(url);
      }
    );
  }, [qrcodeId, projects[activeIndex].settings]);

  return (
    <div className="flex h-screen w-screen bg-slate-950">
      <div className="w-60 bg-slate-800">
        {projects.map((project, index) => (
          <ProjectButton
            key={index}
            title={project.title}
            onClick={() => setActiveIndex(index)}
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
              value={projects[activeIndex].endPoint}
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
              value={projects[activeIndex].settings.errorCorrectionLevel}
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
              value={projects[activeIndex].content}
              placeholder={EXAMPLE}
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
