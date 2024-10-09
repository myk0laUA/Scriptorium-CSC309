# CSC309-PP1


Models:

1. User Model attributes: firstName, lastName, email (unique), avatar, phoneNum (unique), templates[], blogPosts[], editability (default=true), upvotedPosts[], downvotedPosts[], upvotedComments[], downvotedComments[]

2. Template Model attributes: title (unique), explanation (optional?), tags, many-to-one relationship with users, hidden (default=false), forkedFrom (optional), code

3. Blog Post Model attributes: title (unique), description, tags, many-to-one with users, link to templates (optional), blogPosts[], upvotes, downvotes (default = 0), report (optional), numReports, hidden (default=false), author 

4. Comment Model attributes: body, upvotes, downvotes (default = 0), report (optional), numReports, hidden (default=false), author 

5. Report Model attributes: blogPost/model, explanation(optional?), contentId, ContentType( blogpost/ comment)