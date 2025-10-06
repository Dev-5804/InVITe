import UserNavBar from "@/components/UserNavBar";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function EventPage() {
    const router = useRouter();
    const eventId = router.query.eventId;
    const [eventData, setEventData] = useState([]);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: "",
        contactNumber: ""
    });

    // Function to fill demo credentials
    const fillDemoCredentials = () => {
        setUserInfo({
            name: "Demo User",
            contactNumber: "9876543210"
        });
    };

    // function to handle share button click
    const share = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: eventData.name,
                    text: "Check out this event!",
                    url: window.location.href,
                })
                .then(() => console.log("Successful share"))
                .catch((error) => console.log("Error sharing", error));
        }
    };

    // function to handle free event registration
    const handleRegister = async (e) => {
        e.preventDefault();
        if (isRegistering) return; // Prevent double clicks
        
        // Validate mobile number (basic validation)
        if (userInfo.contactNumber.length < 10) {
            alert("Please enter a valid mobile number (at least 10 digits)");
            return;
        }
        
        setIsRegistering(true);
        try {
            console.log("Sending registration request:", {
                event_id: eventId,
                name: userInfo.name,
                contactNumber: userInfo.contactNumber
            });
            
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/event/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        event_id: eventId,
                        name: userInfo.name,
                        contactNumber: userInfo.contactNumber
                    }),
                }
            );
            
            console.log("Response status:", response.status);
            
            // Handle non-JSON responses
            const contentType = response.headers.get("content-type");
            let data;
            
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                alert("Server error: " + text);
                return;
            }
            
            console.log("Response data:", data);
            
            if (response.ok && data.status === "success") {
                alert("Registration Successful!");
                setShowRegistrationForm(false);
                setUserInfo({ name: "", contactNumber: "" });
            } else if (data.msg === "alreadyregistered") {
                alert("You are already registered for this event.");
            } else {
                alert("Registration failed: " + (data.msg || "Please try again."));
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("An error occurred: " + error.message);
        } finally {
            setIsRegistering(false);
        }
    };

    // function that fetches the event data on load
    const fetchEvent = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/getevent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        event_id: eventId,
                    }),
                }
            );
            if (response.ok) {
                const text = await response.text();
                if (text) {
                    const data = JSON.parse(text);
                    setEventData(data);
                } else {
                    console.error("Empty response from server");
                    alert("Event not found");
                    router.push("/users/dashboard");
                }
            } else {
                console.error(`Failed with status: ${response.status} ${response.statusText}`);
                alert("Failed to load event");
                router.push("/users/dashboard");
            }
        } catch (error) {
            console.error("Error fetching event data:", error.message);
            alert("Error loading event: " + error.message);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchEvent();
        }
    }, [eventId]); // fetch event on component mount and when eventId changes

    if (!eventData || !eventData.cover) {
        // If event data isn't loaded correctly, show loading
        return (
            <div className="pt-20 lg:pt-8 bg-[color:var(--primary-color)] flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-2xl font-bold">Loading event...</div>
                    {!eventId && <div className="text-gray-500 mt-2">Invalid event ID</div>}
                </div>
            </div>
        );
    }
    else
        return (
            <div className="pt-20 lg:pt-8 bg-[color:var(--primary-color)]">
                <UserNavBar />
                
                {/* Registration Form Modal */}
                {showRegistrationForm && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Register for Event</h2>
                            
                            {/* Demo Button */}
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm text-blue-700 mb-2">
                                    <strong>Testing Mode:</strong> Click below to auto-fill demo credentials
                                </p>
                                <button
                                    type="button"
                                    onClick={fillDemoCredentials}
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                    Fill Demo Data
                                </button>
                            </div>
                            
                            <form onSubmit={handleRegister}>
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter your full name"
                                        value={userInfo.name}
                                        onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                                        className="bg-gray-100 p-2 focus:outline-none rounded-lg w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Mobile Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Enter 10-digit mobile number"
                                        pattern="[0-9]{10,15}"
                                        value={userInfo.contactNumber}
                                        onChange={(e) => setUserInfo({...userInfo, contactNumber: e.target.value})}
                                        className="bg-gray-100 p-2 focus:outline-none rounded-lg w-full"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRegistrationForm(false)}
                                        className="flex-1 px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                        disabled={isRegistering}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-2 bg-[color:var(--darker-secondary-color)] text-white rounded hover:bg-[color:var(--secondary-color)]"
                                        disabled={isRegistering}
                                    >
                                        {isRegistering ? "Registering..." : "Register"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                <div className="flex flex-col items-center justify-center">
                    <Head>
                        <title>{eventData.name}</title>
                    </Head>
                    {/* Top div with image */}
                    <div className="relative h-40 sm:h-[25rem] overflow-hidden container shadow-lg">
                        {/* blurred image background */}
                        <Image
                            src={eventData.cover}
                            alt={eventData.name}
                            fill
                            placeholder="blur"
                            blurDataURL={eventData.cover}
                            className="h-[25rem] container filter blur hidden lg:block object-cover"
                        />

                        <div className="absolute inset-0 w-full h-40 sm:h-[25rem] container">
                            <Image
                                // src="https://assets-in.bmscdn.com/nmcms/events/banner/desktop/media-desktop-jo-bolta-hai-wohi-hota-hai-ft-harsh-gujral-0-2023-2-3-t-9-23-51.jpg"
                                src={eventData.cover}
                                alt="Event image"
                                fill
                                className="absolute object-contain object-center"
                            />
                        </div>
                    </div>

                    {/* Second div with event details and ticket pricing */}
                    <div className="container bg-white py-4 mt-4 rounded-lg shadow-md">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                <div className="flex flex-col">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                        {eventData.name}
                                    </h1>
                                    <div className="flex flex-col md:flex-row">
                                        <div className="text-md text-gray-800 mr-4">
                                            <span className="font-bold">
                                                Date:
                                            </span>{" "}
                                            {eventData.date}
                                        </div>
                                        <div className="text-md text-gray-800 mr-4">
                                            <span className="font-bold">
                                                Time:
                                            </span>{" "}
                                            {eventData.time}
                                        </div>
                                        <div className="text-md text-gray-800 mr-4">
                                            <span className="font-bold">
                                                Venue:
                                            </span>{" "}
                                            {eventData.venue}
                                        </div>
                                        <div className="text-md text-gray-800 mr-4">
                                            <span className="font-bold">
                                                Organizer:
                                            </span>{" "}
                                            {eventData.organizer}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left lg:text-right mt-4 lg:mt-0">
                                    <button
                                        onClick={() => setShowRegistrationForm(true)}
                                        className="px-6 py-2 bg-[color:var(--darker-secondary-color)] hover:bg-[color:var(--secondary-color)] text-white rounded focus:outline-none"
                                    >
                                        Register for Free
                                    </button>
                                </div>
                            </div>
                            <div className="border-b border-gray-300 mt-8 mb-4"></div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Event Type
                                    </h3>
                                    <p className="text-gray-800">
                                        Free Event - No Ticket Required
                                    </p>
                                </div>
                                <div className="flex mt-4 md:mt-0">
                                    <button
                                        onClick={share}
                                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
                                    >
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third div with major event details */}
                    <div className="container mt-4 bg-[color:var(--primary-color)]">
                        <div className="container">
                            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                                <div className="mb-4 max-w-5xl bg-white px-6 py-4 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        About the Event
                                    </h3>
                                    {Array(3)
                                        .fill()
                                        .map((_, index) => (
                                            <p
                                                key={index}
                                                className="text-gray-600 text-md"
                                            >
                                                {eventData.description}
                                            </p>
                                        ))}
                                </div>
                                <div className="mb-4 bg-white px-6 py-4 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Registration
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        This is a free event. Click the button below to register.
                                    </p>
                                    <button
                                        onClick={() => setShowRegistrationForm(true)}
                                        className="w-full px-6 py-3 bg-[color:var(--darker-secondary-color)] hover:bg-[color:var(--secondary-color)] text-white rounded focus:outline-none transition-colors"
                                    >
                                        Register Now
                                    </button>
                                    <p className="text-sm text-[color:var(--darker-secondary-color)] mt-6">
                                        *You will receive a confirmation email after registration.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
}

export default EventPage;
