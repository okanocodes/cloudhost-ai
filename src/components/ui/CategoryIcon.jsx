import { Cloud, Globe, Server } from "lucide-react";

export default function CategoryIcon({ category, size = 18, className = "" }) {
    if (category === "VPS") return <Server size={size} className={className} />;
    if (category === "Cloud Server") return <Cloud size={size} className={className} />;
    return <Globe size={size} className={className} />;
}