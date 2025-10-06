import { useLoaderData } from "react-router";

// Components
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const data = useLoaderData() as { message: string };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">{data.message}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Welcome to your application. Start building your amazing features here!
        </p>
        <div className="space-x-4">
          <Button variant="outline">Get Started</Button>
          <Button>Learn More</Button>
        </div>
      </div>
    </div>
  );
};


export const HomePageLoader = () => {
    return {
      message: "Hello World",
    };
  };
  