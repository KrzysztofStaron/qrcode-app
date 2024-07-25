import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";

interface ProjectButtonProps {
  title: string;
  onTitleChanged: CallableFunction;
  onClick: CallableFunction;
  setOld: CallableFunction;
  isActive: boolean;
  isNew: boolean;
  removeSelf: CallableFunction;
}

const ProjectButton = ({
  title,
  onTitleChanged,
  onClick,
  isActive,
  isNew,
  setOld,
  removeSelf,
}: ProjectButtonProps) => {
  const oldTitle = useRef("");
  const [editing, setEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isNew) {
      setEditing(true);
    }

    oldTitle.current = title;
  }, []);

  const confirmTitle = () => {
    setEditing(false);
    if (tempTitle.trim() === "") {
      removeSelf();
      return;
    }
    if (isNew) {
      onClick();
      setOld();
    }

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
      className={`flex items-center justify-center h-10 w-full pl-2 truncate ${
        isActive ? "bg-slate-600" : "bg-slate-700"
      } hover:bg-slate-600 text-white`}
      onClick={(e) => onClick()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
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
      {(isHovering || isActive) && !editing ? (
        <button
          className="flex items-center justify-center mr-2 hover:text-gray-400"
          onClick={() => removeSelf()}
        >
          <FiTrash2 />
        </button>
      ) : null}
    </div>
  );
};

export default ProjectButton;
