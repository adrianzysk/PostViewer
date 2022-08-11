import { Layout } from '@/src/layouts';
import { Page, Pagination } from '../components';
import { getPosts } from './api/api';
import { useState, useEffect } from 'react';

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
    const [selectedPage, setSelectedPage] = useState(1);
    const [selectedPosts, setSelectedPosts] = useState<PostProps[]>([]);
    useEffect(() => {
        setSelectedPosts(allPosts.slice(20 * selectedPage - 20, 20 * selectedPage));
    }, [selectedPage]);

    return (
        <Layout pageTitle="Post Viewer">
            <Pagination total={totalCount} selected={selectedPage} />
            <Page selectedPosts={selectedPosts} />
            <Pagination total={totalCount} selected={selectedPage} />
        </Layout>
    );
};

export async function getStaticProps() {
    try {
        const postsData = await getPosts(1, 500);
        const totalCount = postsData.posts?.meta?.totalCount;
        const allPosts = postsData.posts?.data;
        return { props: { totalCount, allPosts }, revalidate: 10 };
    } catch (error) {
        console.log(error);
    }
}

export default HomePage;
