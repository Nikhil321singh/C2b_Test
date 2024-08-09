function Footer() {
  return (
    <>
      <div className="footer h-[70px] w-screen bg-[#4900A8] flex justify-center items-center flex-col  bottom-[0px] mt-auto ">
        <p className="text-white">
          &copy;{new Date().getFullYear()} Unicorn | All Rights Reserved
        </p>
      </div>
    </>
  );
}

export default Footer;
