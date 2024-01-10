import { useNavigate } from "react-router-dom";

function SideMenu({ setsideMenu, sideMenu }) {
  const navigate = useNavigate();
  const handleHome = () => {
    setsideMenu(!sideMenu);
    navigate("/adminHome");
  };

  const handleTable = () => {
    setsideMenu(!sideMenu);
    navigate("/customertable");
  };

  const handleGrade = () => {
    setsideMenu(!sideMenu);
    navigate("/gradepricingsheet");
  };
  return (
    <>
      <div
        className={
          "menu fixed left-[-200px] top-0 w-[200px] h-full bg-slate-300 z-50 flex items-center justify-center transition-all duration-950 ease-in " +
          (sideMenu && "left-[0]")
        }
      >
        <ul list-none>
          <li
            className="text-[25px] font-[300] cursor-pointer mb-[2vh]"
            onClick={handleHome}
          >
            Home
          </li>
          <li
            className="text-[25px] font-[300] cursor-pointer mb-[2vh]"
            onClick={handleTable}
          >
            Customer Table
          </li>
          <li
            className="text-[25px] font-[300] cursor-pointer mb-[2vh]"
            onClick={handleGrade}
          >
            Grade Pricing
          </li>
          <li
            className="text-[25px] font-[300] cursor-pointer mb-[2vh]"
            onClick={() => setsideMenu(!sideMenu)}
          >
            Profile
          </li>
        </ul>
      </div>
    </>
  );
}

export default SideMenu;
