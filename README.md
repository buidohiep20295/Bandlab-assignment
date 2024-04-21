# Bandlab assignment


## Requirements analysis

### Requirements
- Image size limit to 100MB.
- Minimum throughput handled by the system - 100
- 1k uploaded images per 1h
- 100k new comments per 1h

### Storage analysis

#### Calculation details
- Average image size: 5MB. Converted image is 600x600 and is resized to 600x600 so it only take ~100KB --> in total 5MB
. Also need to have s3 backup: let say we need to x2 the image storage
- 1k uploaded images per hour -> 5MB * 2 * 1000 * 24 = 240GB per day
- Let say we keep images for 10 years, which in total is 240 * 365 * 10 = 876TB ~ 1PB
- For each post (including image metadata, and indexes), let say its 1KB
- 1k posts per hour -> 1KB * 1000 * 24 = 24MB per day
- For each comment, let say it is 0.5KB (including indexes), let say for each post 
there are 10 comments -> 0.5KB * 10 * 1000 * 24 = 120MB per day
- Let say we keep posts & comments for 10 years, so in total we need (24MB + 120MB) * 365 * 10 = 526GB
- For each user, let say user info is 0.1KB, and we have 1B user in the system, then total user data is 100GB
- Let say MongoDB also need replicate data, e.g x3 --> in total we need (526GB + 100GB) * 3 = 1878GB ~ 2TB

#### Summary:
- `S3` storage takes up to nearly 1PB (which is huge, but can be handled by AWS S3). We can also so some kind of optimization, e.g don't store backup for photos that are more than 5 years old.
- `MongoDB` takes up to nearly 2TB (which is also huge, but still can be handled well). We also can do some techniques to improve performance here (horizontal scaling), e.g. sharding. 


### Performance analysis
To support 100 RPS, we could achieve that by horizontal scaling & caching:
- Having `multiple servers` running behind the load balancer.
- Have `load balancer`, distribute the requests evenly among all servers.
- We might also have `separated servers` to handle `image upload`, so that we can scale main servers & image upload servers independently depending on the current load.
- For converting images, `AWS Lambda`'s scaling ability by itself is already fit for this use case.
- For reading data, we can add a `cache` layer on top of the DB layer, e.g using `Redis` to store posts, images, top comments of posts, comments,.. with the sort expiration. Doing this will surely reduce a lot of DB load (which maybe bottleneck if the application is read-heavy). But doing caching should come with caution, as we might need to invalidate cache properly, and avoid setting cache expiration for too long.


## Technical stack
- `Node.js` as the programming language - simple to understand and use.
- `MongoDB` as database, with `mongoose` library to be easily used with `node`. `NoSQL` is used here instead of `SQL` for performance purpose. Note that the data can be inconsistent sometime (e.g the comment count of the post can be incorrect), but that should be acceptable in our case.
- `AWS S3` storage for store lob data, i.e. images in this case.
- `AWS lambda` for offloading compute-heavy task like processing image (convert,  resize) from the main server.
- `Docker` & `Docker Compose` for smooth local development & deployment experience.

## Design overview
- `Post` is stored with image url, along with its metadata. We don't stored comments inside the post, but have the `commentCount` that will be used for indexing, in order to serve the get posts ordered by the number of comments.
- `Comment` is stored separately from post. It holds the `postId` to keep the reference back to the original post. We also create a compound index on the `Comment` document which is (`postId`, `createdAt`), so that we can query comments by post and order by the created time.
- `Image` is also stored as a separated document, because we want to have a layer above the raw image. Doing this allow us to handle other use cases, like convert & serve image with different sizes, formats, or adding permission layer on the image level.
- `UploadImage` API is a separate API from the create post API. The decision is made because we want the codebase is modular, and upload image API can be reused later (e.g allow comment with image). Doing this also make all the API simple and clean, avoid complicated logic. Of course, by choosing this, client side is more complicated now when they need to handle uploading image & creating post as 2 separated actions.
- Depending on the actual access pattern, we could optimize the system with some tweaks at the schema level. For example, if the `get posts` API are used most of the time, we could do some kind of data duplication, for example storing IDs of the 2 latest comments of each post directly on the post. We also can store directly the `jpgImageUrl` inside the post for better performance.
However, doing that would also need to pay the tradeoff, because data duplication need to be handled carefully when the original source of data changes (i.e. when new comment is added, we need to update the list of latest 2 comments ID for that post). Of course, for normal application, they are more likely to be read-heavy, so these optimizations seem reasonable.

## TODOs for production
With the scope of this project, some of the implementation details are skipped:
- Authentication process - this is a must from a real product but in this scope, it is replaced by simply passing the user id in the payload.
- Image uploading & handling - the actual upload to `S3`, calling `lambda` function to resize & convert image are not there, but the idea is simple: the image are first upload to `s3`, and when we call `lambda` function (which also another function that we skip) to resize & convert to jpg, an finally store the urls into the new image record.
- Scaling the system (mentioned above, in the `performance analysis` section)

## Run the System
We can easily run the whole with only a single command:
```bash
docker compose up
```
