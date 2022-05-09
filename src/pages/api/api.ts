import { Gql } from '../zeus';

const getPosts = async (page?: number, limit?: number) => {
    const posts = await Gql('query')({
        posts: [
            {
                options: {
                    paginate: {
                        page: page,
                        limit: limit,
                    },
                },
            },
            {
                data: {
                    id: true,
                    title: true,
                    body: true,
                    user: {
                        username: true,
                    },
                },
                meta: {
                    totalCount: true,
                },
            },
        ],
    });
    return posts;
};

const postPost = async (title: string, body: string) => {
    const posts = await Gql('mutation')({
        createPost: [
            {
                input: {
                    title: title,
                    body: body,
                },
            },
            {
                id: true,
                title: true,
                body: true,
            },
        ],
    });
    return posts;
};

export { getPosts, postPost };
