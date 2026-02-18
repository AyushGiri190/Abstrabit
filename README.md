Challenges Faced
1. Learning Supabase:
Working with Supabase was initially challenging since it was new to me. I studied the documentation to understand authentication, database management, and API handling required for the project.
2. Securing User Bookmarks:
Bookmarks needed to be accessible only to their creators. This was solved by implementing Row Level Security (RLS) to restrict database access per user.
3. Reducing API Calls:
Instead of refetching bookmarks after every add/remove action, I updated the backend accordingly and, on the frontend, modified the array of previously fetched bookmarks directly. This eliminated unnecessary refetching, reduced API calls, and improved overall performance.
4. Handling Large Data (Pagination):
Loading all bookmarks at once could impact performance. Pagination was implemented to load bookmarks in smaller chunks, improving speed and memory efficiency.
