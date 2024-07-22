"use client";
// https://www.npmjs.com/package/qrcode

import React, { use, useEffect, useReducer, useRef, useState } from "react";
import parse from "html-react-parser";
import { toString, QRCodeToStringOptions } from "qrcode";
import { HexColorPicker } from "react-colorful";
import { db } from "../firebase/config";
import { addDoc, collection } from "firebase/firestore";

const EXAMPLE = "example.com";

enum actionTypes {
  COLOR,
  CORRECTION,
  BACKGROUND,
  MARGIN,
  CONTENT,
}

const settingsReducer = (
  state: QRCodeToStringOptions,
  action: { type: actionTypes; payload: any }
): QRCodeToStringOptions => {
  switch (action.type) {
    case actionTypes.COLOR:
      return { ...state, color: { ...state.color, dark: action.payload } };
    case actionTypes.CORRECTION:
      return { ...state, errorCorrectionLevel: action.payload };
    case actionTypes.BACKGROUND:
      return { ...state, color: { ...state.color, light: action.payload } };
    case actionTypes.MARGIN:
      return { ...state, margin: action.payload };

    default:
      return state;
  }
};

const initialize = async (setqrcodeId: CallableFunction) => {
  // new File
  const docRef = await addDoc(collection(db, "codes"), {});
  console.log(docRef.id);
  setqrcodeId(docRef.id);
};

const Home = () => {
  const [qrcodeId, setqrcodeId] = useState("");
  const [codeData, setCodeData] = useState("");
  const [contentType, setContentType] = useState("");
  const [content, setContent] = useState("");

  //const [color, setColor] = useState("#000000");
  //const [lightColor, setLightColor] = useState("#ffffff");
  const [settings, updateSettings] = useReducer(settingsReducer, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "H",
    color: {
      dark: "#000",
      light: "fff",
    },
  });

  useEffect(() => {
    if (!qrcodeId) {
      initialize(setqrcodeId);
    }
  }, []);

  useEffect(() => {
    toString(qrcodeId || EXAMPLE, settings, function (err: any, url: string) {
      setCodeData(url);
    });
  }, [qrcodeId, settings]);

  /*useEffect(() => {
    updateSettings({ type: actionTypes.COLOR, payload: color });
  }, [color]);

  useEffect(() => {
    updateSettings({ type: actionTypes.BACKGROUND, payload: lightColor });
  }, [lightColor]);*/

  return (
    <div className="flex h-screen w-screen bg-slate-950">
      <div className="w-60">
        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => initialize(setqrcodeId)}
          >
            New QRCode
          </button>
        </div>
        <div className="flex items-center justify-center">
          <div className="font-mono">
            <label className="text-white">QRCode ID: </label>
            <input
              type="text"
              className="w-full outline-none border-b-2 border-l-2 border-r-2 border-gray-700 hover:border-gray-600 focus:border-gray-500 text-sm rounded-b-md block p-2.5 bg-gray-700 text-white"
              value={qrcodeId}
              readOnly
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-grow">
        <div className="font-mono">
          <label className="text-white">Error correction: </label>
          <select
            onChange={(e) =>
              updateSettings({
                type: actionTypes.CORRECTION,
                payload: e.target.value,
              })
            }
            value="M"
          >
            <option value="L">Low</option>
            <option value="M">Medium</option>
            <option value="Q">Quartile</option>
            <option value="H">High</option>
          </select>
          <br />

          <label className="text-white">Margin: </label>

          <input
            type="range"
            min="0"
            max="10"
            className="cursor-grab"
            onChange={(e) => {
              updateSettings({
                type: actionTypes.MARGIN,
                payload: Number(e.target.value),
              });
            }}
          />
          <br />

          <label className="text-white">Endpoint type: </label>
          <select
            onChange={(e) => setContentType(e.target.value)}
            value="redirect"
          >
            <option value="redirect">Redirect</option>
            <option value="text">Quartile</option>
            <option value="image">Image</option>
          </select>

          {/*<div className="flex">
          <HexColorPicker color={color} onChange={setColor} className="" />
          <HexColorPicker
            color={lightColor}
            onChange={setLightColor}
            className="ml-4"
          />
        </div>*/}

          <div>
            <QRCodePreview data={codeData} />
            <input
              type="text"
              className="w-full outline-none border-b-2 border-l-2 border-r-2 border-gray-700 hover:border-gray-600 focus:border-gray-500 text-sm rounded-b-md block p-2.5 bg-gray-700 text-white"
              onChange={(e) => setContent(e.target.value)}
              value={content}
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
