import Image from "next/image";
import { cn } from "@/lib/utils";

interface PropSpaceLogoProps {
  className?: string;
}

const PropSpaceLogo = ({ className = "w-full h-full" }: PropSpaceLogoProps) => {
  return (
    <>
      <Image
        src="/logo.svg"
        alt="PropSpace X logo"
        width={379}
        height={73}
        className={cn(className, "dark:hidden")}
      />
      <Image
        src="/logo-dark.svg"
        alt="PropSpace X logo"
        width={379}
        height={73}
        className={cn("hidden dark:block", className)}
      />
    </>
  );
};

export default PropSpaceLogo;
