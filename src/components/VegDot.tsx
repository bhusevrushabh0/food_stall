export default function VegDot({ veg }: { veg: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0 ${
        veg ? "bg-green-500" : "bg-red-500"
      }`}
    />
  );
}
