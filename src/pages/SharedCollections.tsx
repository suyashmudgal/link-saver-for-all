import DashboardLayout from "@/components/DashboardLayout";
import CreateShareDialog from "@/components/CreateShareDialog";
import SharedCollectionsList from "@/components/SharedCollectionsList";
import { Share2 } from "lucide-react";

const SharedCollections = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 gold-divider" />
              <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">Published</p>
            </div>
            <h1 className="font-serif-display text-4xl tracking-tight leading-none flex items-center gap-3">
              <Share2 className="w-6 h-6 text-primary" strokeWidth={1.25} /> Shared Collections
            </h1>
            <p className="text-sm text-muted-foreground mt-2">Manage your public link collections</p>
          </div>
          <CreateShareDialog />
        </div>
        <SharedCollectionsList />
      </div>
    </DashboardLayout>
  );
};

export default SharedCollections;
