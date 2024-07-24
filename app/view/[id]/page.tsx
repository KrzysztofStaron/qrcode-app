"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Spinner from "@/app/spinner/spinner";

// import { Project } from "../../generator/page";

export default function Page({ params }: { params: { id: string } }) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const srcDoc = await getDoc(doc(db, "projects", params.id));
      const projDoc = await getDoc(doc(db, srcDoc.data()!.path));

      if (projDoc?.data()?.endPoint === "redirect") {
        window.location.href = projDoc!.data()?.content;
      } else if (projDoc?.data()?.endPoint === "text") {
        setText(projDoc!.data()?.content);
      } else {
        setText("Error: Invalid endPoint");
      }

      setLoading(false);
    };

    init();
  }, []);

  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        {loading ? <Spinner /> : <p className="font-2xl text-white">{text}</p>}
      </div>
    </>
  );
}
