# Newfeed Components

This directory contains all the components for the social media newfeed page for pet lovers.

## Components

1. **PostCreation.jsx** - Component for creating new posts
   - Text input area for post content
   - Pet tagging functionality (required)
   - Image attachment support
   - Emoji picker
   - Post submission button (disabled when content is empty)

2. **PostFilter.jsx** - Filter controls for the post feed
   - Latest posts filter
   - Following posts filter
   - Popular posts filter

3. **PostItem.jsx** - Individual post component
   - User information and timestamp
   - Tagged pet display
   - Post content and images
   - Like and comment functionality
   - Comment input form (disabled when empty)
   - Dropdown menu for reporting/hiding posts

4. **PeopleYouMayKnow.jsx** - Suggested users component
   - Random user suggestions
   - Follow/Unfollow functionality

5. **UserProfile.jsx** - Current user profile component
   - User information display
   - Post/follower/following counts
   - List of user's pets

## Usage

All components are exported through the index.js file for easy importing:

```javascript
import { PostCreation, PostFilter, PostItem, PeopleYouMayKnow, UserProfile } from "@/components/user/newfeed";
```