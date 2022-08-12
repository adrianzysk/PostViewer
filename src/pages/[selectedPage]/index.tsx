/* eslint-disable no-unused-labels */
import { Layout } from '@/src/layouts';
import { Page, Pagination } from '../../components';
import { getPosts } from '../../api/api';

interface PostProps {
    id: string;
    title: string;
    body: string;
    user: {
        username: string;
    };
}

interface HomePageProps {
    totalCount: number;
    allPosts: Array<PostProps>;
    pageNumber: number;
}

const HomePage: React.FC<HomePageProps> = ({ totalCount, allPosts, pageNumber }) => {
    return (
        <Layout pageTitle="Post Viewer">
            <Pagination total={totalCount} selected={pageNumber} />
            <Page selectedPosts={allPosts} />
            <Pagination total={totalCount} selected={pageNumber} />
        </Layout>
    );
};

export const getStaticPaths = async () => {
    const postsData = await getPosts(1, 1);
    const totalCount = postsData.posts?.meta?.totalCount;
    let arr;
    if (totalCount) {
        arr = Array.from({ length: Math.floor(Math.min(totalCount / 20, 10)) }, (_, index) => index + 1);
        arr = arr.map((x) => ({
            params: {
                selectedPage: x.toString(),
            },
        }));
    }
    return {
        paths: arr,
        fallback: 'blocking',
    };
};

export const getStaticProps = async (context: any) => {
    const pageNumber = context?.params?.selectedPage;
    try {
        const postsData = await getPosts(parseInt(pageNumber), 20);
        const totalCount = postsData.posts?.meta?.totalCount;
        const allPosts = postsData.posts?.data;
        return { props: { pageNumber, totalCount, allPosts }, revalidate: 10 };
    } catch (error) {
        console.log(error);
    }
};

export default HomePage;
