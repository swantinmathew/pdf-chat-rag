import Hero4 from "@/components/Hero4";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";

export default function Home() {
  const customNavLinks = [
    { label: "Architecture", href: "#architecture" },
    { label: "PDF Upload", href: "/upload" },
    { label: "AI Chat", href: "/chat" },
    { label: "GitHub", href: "https://github.com/swantinmathew/pdf-chat-rag" },
  ];

  return (
    <div className="bg-[#0d0b0f] flex min-h-screen w-full flex-col justify-center p-0 m-0">
      <Hero4
        brandName="Docent"
        navLinks={customNavLinks}
        loginLabel="Upload PDF"
        loginHref="/upload"
        badgeText="✦  Powered by FastAPI, LangGraph & Supabase pgvector"
        headingLine1="Where AI Intelligence"
        headingLine2="Meets Search Impact."
        description="Docent empowers modern teams to ingest PDFs, vectorize text with Supabase pgvector, and stream grounded RAG answers in real-time."
        primaryCtaLabel="Start RAG Chat"
        primaryCtaHref="/chat"
        secondaryCtaLabel="Upload PDF"
        secondaryCtaHref="/upload"
        achievementText="Processed over 1,000+ vector chunks with sub-second retrieval"
        backgroundImage="https://assets.watermelon.sh/hero-5.avif"
      />

      {/* Interactive RAG Pipeline Feature Section */}
      <div id="architecture">
        <FeatureSection />
      </div>

      {/* Landing Page Footer */}
      <Footer />
    </div>
  );
}
