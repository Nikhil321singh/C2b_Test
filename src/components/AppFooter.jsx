import {useEffect, useState} from "react";
import { MdOutlineHome } from "react-icons/md";
import { FaRegLightbulb } from "react-icons/fa";
import { IoBagAddOutline } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import styles from "../styles/AppFooter.module.css";

const AppFooter = () => {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = () => {
    if (window.scrollY > lastScrollY) { // if scroll down hide the navbar
      setShow(false); 
    } else { // if scroll up show the navbar
      setShow(true);  
    }

    // remember current page location to use in the next move
    setLastScrollY(window.scrollY); 
  };

  useEffect(() => {
    window.addEventListener('scroll', controlNavbar);

    // cleanup function
    return () => {
       window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <div className={`${show ? "bottom-0" : "-bottom-[60px]" } bg-white flex border-2 py-2 justify-around w-full footer fixed ${styles.footer_wrap}`}>
      <div className="flex flex-col items-center">
        <MdOutlineHome size={24} />
        <button className="text-sm">Home</button>
      </div>
      <div className="flex flex-col items-center">
        <BiCategory size={24} />
        <button className="text-sm">Categories</button>
      </div>
      <div className="flex flex-col items-center">
        <IoBagAddOutline size={24} />
        <button className="text-sm">Orders</button>
      </div>
      <div className="flex flex-col items-center">
        <FaRegLightbulb size={24} />
        <button className="text-sm">Help</button>
      </div>
    </div>
  );
};

export default AppFooter;
