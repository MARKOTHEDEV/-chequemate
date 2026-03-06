import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-[#9CA3AF]" />
      </div>
      <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">{title}</h2>
      <p className="text-[#6B7280] text-center max-w-md">
        This feature is currently under development. Check back soon for updates!
      </p>
    </div>
  );
}
