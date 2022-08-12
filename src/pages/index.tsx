import { Layout } from '@/src/layouts';
import { Page, Pagination } from '../components';
import { getPosts } from '../api/api';

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
}

const HomePage: React.FC<HomePageProps> = ({ totalCount, allPosts }) => {
    return (
        <Layout pageTitle="Post Viewer">
            <Pagination total={totalCount} selected={1} />
            <Page selectedPosts={allPosts} />
            <Pagination total={totalCount} selected={1} />
        </Layout>
    );
};

export const getStaticProps = async () => {
    try {
        const postsData = await getPosts(1, 20);
        const totalCount = postsData.posts?.meta?.totalCount;
        const allPosts = postsData.posts?.data;
        return { props: { totalCount, allPosts }, revalidate: 10 };
    } catch (error) {
        console.log(error);
    }
};

export default HomePage;
