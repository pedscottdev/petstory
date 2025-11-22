# Eloquent Models for PetStory Application

This directory contains all the Eloquent models for the PetStory application, designed to work with Laravel 12 and MongoDB.

## Models and Their Relationships

### User
Represents a user in the system.
- **Relationships**:
  - Has many Pets (owner_id)
  - Has many Posts (author_id)
  - Has many Comments (author_id)
  - Has many Groups (creator_id)
  - Has many GroupMembers (user_id)
  - Has many Follows (follower_id, following_id)
  - Has many Messages (sender_id, receiver_id)
  - Has many Notifications (user_id)
  - Has many Reports (reporter_id)
  - Has many OtpVerifications (user_id)
  - Has many PersonalAccessTokens (tokenable_id)

### Pet
Represents a pet in the system.
- **Relationships**:
  - Belongs to User (owner_id)
  - Has many PetLikes (pet_id)

### Post
Represents a post in the system.
- **Relationships**:
  - Belongs to User (author_id)
  - Belongs to Group (group_id)
  - Has many PostMultimedia (post_id)
  - Has many PostLikes (post_id)
  - Has many Comments (post_id)

### PostMultimedia
Represents multimedia content attached to a post.
- **Relationships**:
  - Belongs to Post (post_id)

### PostLike
Represents a like on a post.
- **Relationships**:
  - Belongs to User (user_id)
  - Belongs to Post (post_id)

### Comment
Represents a comment on a post.
- **Relationships**:
  - Belongs to Post (post_id)
  - Belongs to User (author_id)
  - Belongs to Comment (parent_id) - for replies
  - Has many Comments (parent_id) - replies

### PetLike
Represents a like on a pet.
- **Relationships**:
  - Belongs to User (user_id)
  - Belongs to Pet (pet_id)

### Group
Represents a group in the system.
- **Relationships**:
  - Belongs to User (creator_id)
  - Has many GroupMembers (group_id)
  - Has many Posts (group_id)

### GroupMember
Represents a membership of a user in a group.
- **Relationships**:
  - Belongs to Group (group_id)
  - Belongs to User (user_id)

### Follow
Represents a follow relationship between users.
- **Relationships**:
  - Belongs to User (follower_id)
  - Belongs to User (following_id)

### Message
Represents a message between users.
- **Relationships**:
  - Belongs to User (sender_id)
  - Belongs to User (receiver_id)

### Notification
Represents a notification for a user.
- **Relationships**:
  - Belongs to User (user_id)

### Report
Represents a report submitted by a user.
- **Relationships**:
  - Belongs to User (reporter_id)
  - Belongs to Post (post_id)

### OtpVerification
Represents an OTP verification record.
- **Relationships**:
  - Belongs to User (user_id)

### PersonalAccessToken
Represents a personal access token for API authentication.
- **Relationships**:
  - Morphs to User (tokenable_id, tokenable_type)

## Indexes

The following unique indexes are enforced through database migrations:

1. `users.email` - Unique email for each user
2. `post_likes.user_id + post_likes.post_id` - Composite unique key for post likes
3. `pet_likes.user_id + pet_likes.pet_id` - Composite unique key for pet likes
4. `group_members.group_id + group_members.user_id` - Composite unique key for group memberships
5. `follows.follower_id + follows.following_id` - Composite unique key for follows
6. `otp_verifications.expires_at` - TTL index for automatic cleanup of expired OTPs

## Notes

- All models extend `MongoDB\Laravel\Eloquent\Model` to work with MongoDB
- Timestamps are handled automatically by the models
- Relationships are defined using standard Eloquent relationship methods
- Mass assignment protection is implemented using the `$fillable` property
- Attribute casting is used to ensure proper data types