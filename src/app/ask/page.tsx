import { Header } from "@/components/layout/header";
import { AskQuestionForm } from "@/components/ask-question-form";
import { getCategoriesFromSupabase } from "@/lib/supabase-queries";

export default async function AskQuestionPage() {
  const categories = await getCategoriesFromSupabase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ask a Question</h1>
          <p className="text-muted-foreground">
            Share your question with the community and get helpful answers from
            other members.
          </p>
        </div>
        <AskQuestionForm categories={categories} />
      </main>
    </div>
  );
}
