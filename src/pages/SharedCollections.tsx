import DashboardLayout from "@/components/DashboardLayout";
import CreateShareDialog from "@/components/CreateShareDialog";
import SharedCollectionsList from "@/components/SharedCollectionsList";
import { Share2 } from "lucide-react";

const SharedCollections = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shared Collections</h1>
              <p className="text-sm text-muted-foreground">Manage your public link collections</p>
            </div>
          </div>
          <CreateShareDialog />
        </div>
        <SharedCollectionsList />
      </div>
    </DashboardLayout>
  );
};

export default SharedCollections;
