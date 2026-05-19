import FridgeScanner from "@/components/FridgeScanner";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[calc(100vh-8rem)]">
      <FridgeScanner />
    </div>
  );
}