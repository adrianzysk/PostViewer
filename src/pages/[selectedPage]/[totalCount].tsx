import { Layout } from '@/src/layouts';
import { Page, Pagination } from '../../components';
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

export async function getStaticPaths(context: any) {
    const totalCount = context.totalCount;
    return {
        paths: [
            {
                params: {
                    selectedPage: '1',
                    totalCount: '500',
                },
            },
        ],
        fallback: 'blocking',
    };
}

export async function getStaticProps(context: any) {
    const pageNumber = context?.params?.selectedPage;
    try {
        const postsData = await getPosts(1, 500);
        const totalCount = postsData.posts?.meta?.totalCount;
        const allPosts = postsData.posts?.data;
        return { props: { pageNumber, totalCount, allPosts }, revalidate: 10 };
    } catch (error) {
        console.log(error);
    }
}

export default HomePage;
