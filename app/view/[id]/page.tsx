"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Spinner from "@/app/spinner/spinner";
import { getDownloadURL, ref } from "firebase/storage";

// import { Project } from "../../generator/page";

export default function Page({ params }: { params: { id: string } }) {
  const [text, setText] = useState<string>("");
  const [isImage, setIsImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const srcDoc = await getDoc(doc(db, "projects", params.id));
      const projDoc = await getDoc(doc(db, srcDoc.data()!.path));

      if (projDoc?.data()?.endPoint === "redirect") {
        let target = projDoc!.data()?.content;
        if (!target.startsWith("https://")) {
          target = `https://${target}`;
        }
        location.href = target;
      } else if (projDoc?.data()?.endPoint === "text") {
        setText(projDoc!.data()?.content);
      } else if (projDoc?.data()?.endPoint === "image") {
        getDownloadURL(ref(storage, projDoc?.data()?.content))
          .then((url) => {
            // `url` is the download URL for 'images/stars.jpg'

            // This can be downloaded directly:
            const xhr = new XMLHttpRequest();
            xhr.responseType = "blob";
            xhr.onload = (event) => {
              const blob = xhr.response;
            };
            xhr.open("GET", url);
            xhr.send();

            // Or inserted into an <img> element
            const img = document.getElementById("myimg");
            img?.setAttribute("src", url);
            setIsImage(true);
          })
          .catch((error) => {
            // Handle any errors
          });
      } else {
        setText("Error: Invalid endPoint");
      }

      setLoading(false);
    };

    init();
  }, []);

  let msg = <p className="font-2xl text-white">{text}</p>;
  if (isImage) {
    msg = <img id="myimg" />;
  }

  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        {loading ? <Spinner /> : msg}
      </div>
    </>
  );
}
