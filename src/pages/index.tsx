import { Layout } from '@/src/layouts';
import { Page, Pagination } from '../components/atoms';
import { getPosts } from './api/api';
import React, { useState, useEffect } from 'react';

interface PostProps {
    id: string;
    title: string;
    body: string;
    user: {
        username: string;
    };
}

interface HomePageProps {
    total: number;
    allPosts: Array<PostProps>;
}

const HomePage: React.FC<HomePageProps> = ({ total, allPosts }) => {
    const [selectedPage, setSelectedPage] = useState(1);
    const [selectedPosts, setSelectedPosts] = useState<PostProps[]>([]);
    useEffect(() => {
        setSelectedPosts(allPosts.slice(20 * selectedPage - 20, 20 * selectedPage));
    }, [selectedPage]);

    return (
        <Layout pageTitle="Post Viewer">
            <Pagination total={total} selected={selectedPage} selectionFunction={setSelectedPage} />
            <Page selectedPosts={selectedPosts} />
            <Pagination total={total} selected={selectedPage} selectionFunction={setSelectedPage} />
        </Layout>
    );
};

export async function getServerSideProps() {
    try {
        const postsData = await getPosts(1, 500);
        const total = postsData.posts?.meta?.totalCount;
        const allPosts = postsData.posts?.data;
        return { props: { total, allPosts } };
    } catch (error) {
        console.log(error);
    }
}

export default HomePage;
