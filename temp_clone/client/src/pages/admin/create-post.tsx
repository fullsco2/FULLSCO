import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { slugify, cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/admin/sidebar";
import { Menu } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SafeCheckbox } from "@/components/ui/safe-checkbox";
import { SafeInput } from "@/components/ui/safe-input";
import { SafeTextarea } from "@/components/ui/safe-textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { insertPostSchema } from "@shared/schema";

// Extend the schema to make the slug field optional (it will be auto-generated)
const createPostSchema = insertPostSchema
  .extend({
    slug: z.string().optional(),
  })
  .refine(
    (data) => {
      // Ensure author ID is a number if provided
      if (data.authorId) return typeof data.authorId === "number";
      return true;
    },
    {
      message: "Author ID must be a number",
      path: ["authorId"],
    }
  );

type CreatePostFormValues = z.infer<typeof createPostSchema>;

const CreatePost = () => {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // إضافة حالة السايدبار للموبايل
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Set up form
  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      authorId: user?.id,
      imageUrl: "",
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
    },
  });

  // Set author ID when user is loaded
  useEffect(() => {
    if (user?.id) {
      // Make sure user.id is a number
      const authorId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      if (!isNaN(authorId)) {
        form.setValue("authorId", authorId);
      }
    }
  }, [user, form]);

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreatePostFormValues) => {
      // Generate slug if not provided
      if (!values.slug) {
        values.slug = slugify(values.title);
      }

      // Generate excerpt if not provided
      if (!values.excerpt && values.content) {
        values.excerpt = values.content.substring(0, 160);
      }

      // Generate meta title if not provided
      if (!values.metaTitle && values.title) {
        values.metaTitle = values.title;
      }

      // Generate meta description if not provided
      if (!values.metaDescription && values.excerpt) {
        values.metaDescription = values.excerpt;
      }

      const response = await apiRequest("POST", "/api/posts", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "The blog post has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      navigate("/admin/posts");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CreatePostFormValues) => {
    createMutation.mutate(values);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* السايدبار للجوال */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => {
          console.log('CreatePost: closing sidebar');
          setSidebarOpen(false);
        }} 
      />

      <div className={cn(
        "transition-all duration-300",
        isMobile ? "w-full" : "mr-64"
      )}>
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2" 
                  onClick={() => setSidebarOpen(true)}
                  aria-label="فتح القائمة"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div>
                <Button
                  variant="outline"
                  className="mb-4"
                  onClick={() => navigate("/admin/posts")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Blog Post
                </h1>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <SafeInput placeholder="Post title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <SafeTextarea
                            placeholder="Post content"
                            className="min-h-64"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Write the full content of your blog post here. You can use multiple
                          paragraphs separated by line breaks.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <SafeTextarea
                            placeholder="Short description of the post (will be auto-generated if left empty)"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief summary of the post, used in previews and search results.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Image URL</FormLabel>
                        <FormControl>
                          <SafeInput placeholder="https://..." {...field} />
                        </FormControl>
                        <FormDescription>
                          URL of an image to be used as the featured image for this post.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <SafeCheckbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Post</FormLabel>
                          <FormDescription>
                            Featured posts appear prominently on the home page and blog listing.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
                    
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <SafeInput
                                placeholder="SEO title (defaults to post title if left empty)"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The title that appears in search engine results.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <SafeTextarea
                                placeholder="SEO description (defaults to excerpt if left empty)"
                                className="min-h-20"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The description that appears in search engine results.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/posts")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Creating..." : "Publish Post"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CreatePost;
