import React, { useState, KeyboardEvent, useRef, useEffect } from "react";

interface ProjectButtonProps {
  title: string;
  onTitleChanged: CallableFunction;
  onClick: CallableFunction;
}

const ProjectButton = ({
  title,
  onTitleChanged,
  onClick,
}: ProjectButtonProps) => {
  const oldTitle = useRef("");
  const [editing, setEditing] = useState(true);
  const [tempTitle, setTempTitle] = useState(title);

  useEffect(() => {
    oldTitle.current = title;
  }, []);

  const confirmTitle = () => {
    setEditing(false);

    if (oldTitle.current !== tempTitle) {
      onTitleChanged(tempTitle);
    }

    oldTitle.current = tempTitle;
  };

  const handleInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      confirmTitle();
    } else if (event.key === "Escape") {
      setEditing(false);
      setTempTitle(title);
    }
  };

  return (
    <div
      className="flex items-center justify-center h-10 w-full pl-2 bg-slate-700 hover:bg-slate-600 text-white "
      onClick={(e) => onClick()}
    >
      {editing ? (
        <input
          type="text"
          className="grow bg-transparent focus:outline-none"
          autoFocus
          value={tempTitle || ""}
          onChange={(e) => setTempTitle(e.target.value)}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={handleInputKeyPress}
          onBlur={confirmTitle}
        />
      ) : (
        <button
          className="grow text-left"
          onContextMenu={(e) => {
            e.preventDefault();
            setEditing(true);
          }}
        >
          {title}
        </button>
      )}
    </div>
  );
};

export default ProjectButton;
