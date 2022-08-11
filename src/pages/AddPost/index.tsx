import { useRef } from 'react';
import { Layout } from '../../layouts';
import Link from 'next/link';
import { postPost } from '../api/api';
import styled from '@emotion/styled';

const Wrapper = styled.div`
    max-width: 1000px;
    padding: 5px;
    margin: auto;
`;

const Button = styled.a`
    font-size: 25px;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 50px;
    margin: 10px 0;
    background-color: white;
    border: 2px solid black;
    border-radius: 5px;
    &:hover {
        text-decoration: none;
        opacity: 0.8;
        color: #328efe;
    }
    @media (max-width: 768px) {
        width: 100px;
        height: 35px;
    }
`;

const Form = styled.form`
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    margin: auto;
    text-align: left;
    color: gray;
    input[type='text'] {
        font-size: 2.5rem;
        padding: 10px 2px;
        background-color: aliceblue;
        border: 1px solid gray;
    }
    input[type='text']:focus {
        background-color: white;
    }
    input[type='submit'] {
        font-size: 20px;
        width: 200px;
        height: 40px;
        margin: 10px 0;
        border: transparent;
        border-radius: 25px;
        color: whitesmoke;
        background-color: rgb(23, 23, 99);
    }
    input[type='submit']:hover {
        opacity: 0.8;
        cursor: pointer;
    }
    textarea {
        background-color: aliceblue;
        font-size: 2.5rem;
        padding: 10px 2px;
        resize: vertical;
    }
    textarea:focus {
        background-color: white;
        font-size: 2.5rem;
        padding: 10px 2px;
        resize: vertical;
    }
    label {
        font-size: 3rem;
        margin-top: 10px;
        margin-bottom: 4px;
    }
`;

const AddPost: React.FC = () => {
    const titleInputRef = useRef<HTMLInputElement>(null);
    const bodyInputRef = useRef<HTMLTextAreaElement>(null);
    const sendPost = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const title = titleInputRef.current?.value;
        const body = bodyInputRef.current?.value;
        try {
            let post;
            if (title && body) {
                post = await postPost(title, body);
            }
            if (post?.createPost?.id) {
                alert('Post created');
            } else {
                alert('Post not created');
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <Layout>
            <Wrapper>
                <Link href="/">
                    <Button>Back</Button>
                </Link>
                <Form id="someForm" onSubmit={sendPost}>
                    <label>Title</label>
                    <input type="text" required ref={titleInputRef} name="title" />
                    <label>Text</label>
                    <textarea required rows={10} ref={bodyInputRef} name="body" />
                    <input type="submit" value="Create a Post" />
                </Form>
            </Wrapper>
        </Layout>
    );
};

export default AddPost;
