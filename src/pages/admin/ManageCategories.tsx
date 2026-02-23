import { useState } from "react";
import { collection, deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import type { Category } from "@/types/models";

export default function ManageCategories() {
  const { categories } = useCategories();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);

  async function handleCreateCategory() {
    const cleanedName = name.trim();
    if (!cleanedName) return;

    try {
      const categoryRef = doc(collection(db, "categories"));
      await setDoc(categoryRef, {
        id: categoryRef.id,
        name: cleanedName,
        createdAt: serverTimestamp(),
      });
      setName("");
      toast({ title: "Category added" });
    } catch {
      toast({ title: "Create failed", description: "Please try again.", variant: "destructive" });
    }
  }

  async function handleDeleteCategory() {
    if (!toDelete) return;

    try {
      await deleteDoc(doc(db, "categories", toDelete.id));
      setToDelete(null);
      toast({ title: "Category deleted" });
    } catch {
      toast({ title: "Delete failed", description: "Please try again.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Categories</h1>

      <Card>
        <CardHeader><CardTitle>Add Category</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Category name" value={name} onChange={(event) => setName(event.target.value)} />
          <Button onClick={handleCreateCategory}>Add Category</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Existing Categories</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
              <Badge variant="secondary">{category.name}</Badge>
              <Button variant="ghost" size="icon" onClick={() => setToDelete(category)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {categories.length === 0 ? <p className="text-sm text-muted-foreground">No categories yet.</p> : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Delete <strong>{toDelete?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
