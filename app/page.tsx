"use client";
// https://www.npmjs.com/package/qrcode

import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import QRCode from "qrcode";

const Home = () => {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState<React.ReactNode>(null);

  const [qrCodeOptions, setQrCodeOptions] = useState<any>({
    type: "svg",
    scale: 4,
    color: {
      dark: "#00F",
      light: "#f0f0f0",
    },
  });

  useEffect(() => {
    QRCode.toString(
      text || "https://example.com",
      qrCodeOptions,
      function (err: any, url: string) {
        setQrCode(parse(url));
      }
    );
  }, [text]);

  return (
    <>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="w-52 h-52">{qrCode}</div>
    </>
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
export default Home;
