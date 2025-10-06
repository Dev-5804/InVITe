import Image from "next/image";
import { useRouter } from "next/router";

export default function NavBar() {
    const router = useRouter();

    return (
        <div className="mb-[8vh]">
            <header className="bg-[color:var(--white-color)] fixed top-0 z-50 w-full shadow-md text-[color:var(--darker-secondary-color)]">
                <div className="container mx-auto flex items-center flex-col lg:flex-row justify-between p-4">
                    <div
                        onClick={() => router.push("/users/dashboard")}
                        className="flex items-center gap-x-3 cursor-pointer"
                    >
                        <Image
                            src="/favicon_io/android-chrome-192x192.png"
                            width={500}
                            height={500}
                            alt="Logo"
                            className="h-8 w-8"
                        />
                        <h1 className="m-2 text-black font-bold text-4xl">
                            {"<Inv"}
                            <span className="text-[color:var(--darker-secondary-color)]">
                                IT
                            </span>
                            {"e />"}
                        </h1>
                    </div>
                    <nav className="text-sm">
                        <ul className="flex items-center">
                            <li
                                onClick={() => router.push("/users/dashboard")}
                                className="mr-4 cursor-pointer"
                            >
                                <a>Events</a>
                            </li>
                            <li
                                onClick={() => router.push("/")}
                                className="mr-4 cursor-pointer"
                            >
                                <a>About us</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
        </div>
    );
}
