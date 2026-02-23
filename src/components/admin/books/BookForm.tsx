import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateBookDescription } from "@/lib/functions";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/types/models";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
  categoryId: z.string().min(1, "Category is required"),
  tagsInput: z.string(),
  description: z.string().min(1, "Description is required"),
  totalCopies: z.number().int().min(1, "Total copies must be at least 1"),
  coverUrl: z.string().url("Invalid URL").or(z.literal("")),
});

export type BookFormValues = z.infer<typeof bookSchema>;

type BookFormProps = {
  categories: Category[];
  initialValues?: Partial<BookFormValues>;
  onSubmit: (values: BookFormValues) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
};

const defaultValues: BookFormValues = {
  title: "",
  author: "",
  isbn: "",
  categoryId: "",
  tagsInput: "",
  description: "",
  totalCopies: 1,
  coverUrl: "",
};

export function BookForm({
  categories,
  initialValues,
  onSubmit,
  submitLabel,
  submitting,
}: BookFormProps) {
  const { toast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  useEffect(() => {
    form.reset({ ...defaultValues, ...initialValues });
  }, [form, initialValues]);

  async function handleGenerateDescription() {
    const { title, author, tagsInput } = form.getValues();
    if (!title || !author) {
      toast({ title: "Missing details", description: "Please fill title and author first.", variant: "destructive" });
      return;
    }

    try {
      setAiLoading(true);
      const tags = tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean);
      const result = await generateBookDescription({ title, author, tags });
      form.setValue("description", result.data.description, { shouldValidate: true });
    } catch {
      toast({ title: "Failed to generate", description: "Please try again.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Book Information</CardTitle></CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Title" error={form.formState.errors.title?.message}><Input {...form.register("title")} /></Field>
          <Field label="Author" error={form.formState.errors.author?.message}><Input {...form.register("author")} /></Field>
          <Field label="ISBN" error={form.formState.errors.isbn?.message}><Input {...form.register("isbn")} /></Field>
          <Field label="Category" error={form.formState.errors.categoryId?.message}>
            <Select value={form.watch("categoryId")} onValueChange={(value) => form.setValue("categoryId", value, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Tags (comma separated)"><Input {...form.register("tagsInput")} placeholder="fiction, classic" /></Field>
          <Field label="Total Copies" error={form.formState.errors.totalCopies?.message}><Input type="number" min={1} {...form.register("totalCopies", { valueAsNumber: true })} /></Field>
          <Field label="Cover URL (optional)" error={form.formState.errors.coverUrl?.message}><Input {...form.register("coverUrl")} /></Field>
          <Field label="Description" error={form.formState.errors.description?.message}>
            <div className="space-y-2">
              <Button type="button" variant="outline" onClick={handleGenerateDescription} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Generate Description
              </Button>
              <Textarea rows={5} {...form.register("description")} />
            </div>
          </Field>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : submitLabel}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
