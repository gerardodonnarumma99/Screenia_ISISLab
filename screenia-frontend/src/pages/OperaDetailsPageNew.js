import { 
    Paper,
    MenuItem, 
    Grid,
    FormControl,
    InputLabel,
    Select,
    FormControlLabel, 
    FormGroup,
    Switch,
    Button,
    TextField,
    IconButton
} from "@mui/material";
import { useEffect, useState, useCallback, useRef, createRef } from "react";
import { useParams } from "react-router-dom";
import { fetchAllAuthorByOpera, fetchAllComment, fetchAllEditionByOpera, fetchBooksByOpera, fetchOpera, fetchParagraph } from "../api/opereApi";
import ChapterTabs from "../components/Opera/ChapterTabs";
import { toast } from 'react-toastify';
import FullScreenDialog from "../components/Dialog/FullScreenDialog";
import CardAuthor from "../components/Opera/CardAuthor";
import CardEdition from "../components/Opera/CardEdition";
import AuthorDetails from "../components/Author/AuthorDetails";
import EditionDetails from "../components/Edition/EditionDetails";
import CommentContainer from "../components/Comment/CommentContainer";
import BasicMenu from "../components/BasicMenu/BasicMenu";
import SimpleDialog from "../components/Dialog/SimpleDialog";
import CommentParagraph from "../components/Comment/CommentParagraph";
import scrollIntoView from "scroll-into-view-if-needed";
import { 
    selectorAuthorsOfOpera, 
    selectorBooksOfOpera, 
    selectorChaptersOfBook, 
    selectorEditionsOfOpera, 
    selectorParagraphsOfChapter 
} from "../state/opera/opereSelector";
import { useRecoilCallback, useRecoilState, useRecoilValue } from "recoil";
import { operaDetailsAtom, syncTextCommentOpera } from "../state/opera/opereAtom";
import useCommentsChapter from '../customHooks/operaHooks/useCommentsChapter';
import TagAutocomplete from "../components/Tag/TagAutocomplete";
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import authTokenAtom from "../state/authToken/authTokenAtom";
import { userAtom } from "../state/user/userAtom";
import { getCommentsSelector } from "../state/comment/commentSelector";
import { commentAtom } from "../state/comment/commentAtom";
import useOperaDetails from "../customHooks/operaHooks/useOperaDetails";
import { getParagraphsSelector } from "../state/paragraph/paragraphSelector";
import { paragraphAtom } from "../state/paragraph/paragraphAtom";

const CloseButtonFilteredComment = styled(IconButton)(({ theme }) => ({
    position: "relative",
    marginLeft: '100%',
    marginTop: -50,
}));

const SelectBook = ({ books = [], value, handleSelect }) => {
    return (
        <FormControl fullWidth>
            <InputLabel id="select-book-opera" shrink={true}>Select Book</InputLabel>
            <Select
                labelId="select-book-opera"
                id="select-book-opera"
                label="Age"
                onChange={handleSelect}
                value={value}
                sx={{
                    background: "#fff"
                }}
            >
                {books.map(({ number, title }) => {
                    const label = number && title ? `Book #${number} - ${title}` : `Book #${number}`
                    return (<MenuItem value={number}>{label}</MenuItem>)
                })}
            </Select>
        </FormControl>
    )
}

const FilteredComment = ({ handleSave }) => {
    const [tagSelected, setTagSelected] = useState([]);
    const [username, setUsername] = useState("");

    const handleSelectTags = useCallback((items) => {
        setTagSelected(items);
    });

    const handleChangeUsername = useCallback((event) => {
        setUsername(event.target.value)
    });

    const onSearch = () => {
        const tagsTitlte = tagSelected.map(( { title }) => title)
        handleSave(username, tagsTitlte);
        setTagSelected([]);
        setUsername("");
    }

    return (
        <Grid
            container
            direction="row"
            spacing={2} 
            sx={{ 
                bgcolor: 'background.paper',
                padding: 3 }}>
            <CloseButtonFilteredComment>
                <CloseIcon />
            </CloseButtonFilteredComment>
            <Grid item xs={5}>
                <TagAutocomplete 
                    value={tagSelected} 
                    handleSelect={handleSelectTags} />
            </Grid>
            <Grid item xs={5}>
                <TextField 
                    id="filter_comment_user" 
                    label="Commentator" 
                    variant="outlined" 
                    value={username} 
                    onChange={handleChangeUsername} />
            </Grid>
            <Grid item xs={2}>
                <Button
                    size="small"
                    onClick={onSearch}
                    variant="outlined"
                    >
                    Search
                </Button>
            </Grid>
        </Grid>
    )
}

const OperaDetailsPage = () => {
    //Params url
    const { id } = useParams();
    const { paramIdBook } = useParams();
    const { paramIdChapter } = useParams();
    const { paramIdParagraph } = useParams();

    //Local state
    const [bookId, setBookId] = useState(null);
    const [chapterId, setChapterId] = useState(null);
    const [authorSelected, setAuthorSelected] = useState(null);
    const [editionSelected, setEditionSelected] = useState(null);
    const [paragraphId, setParapraghId] = useState(null);
    const [isSyncTextComment, setIsSyncTextComment] = useRecoilState(syncTextCommentOpera);
    const [commentUpdate, setCommentUpdate] = useState(null);

    const itemsMenu = [
        { 
            title: `Download text Chapter #${chapterId}`, 
            action: () => downloadParagraphTxtFile(chapterId, paragraphs)
        }
    ];

    //Global State and Call API
    const [authToken, setAuthToken] = useRecoilState(authTokenAtom);
    const [user, setUser] = useRecoilState(userAtom);
    const { books, authors, editions } = useOperaDetails();
    const chaptersOfBook = useRecoilValue(selectorChaptersOfBook(bookId));

    const comments = useRecoilValue(getCommentsSelector);
    const [commentFilter, setCommentFilter] = useRecoilState(commentAtom);
    const paragraphs = useRecoilValue(getParagraphsSelector);
    const [paragraphFilter, setParagraphFilter] = useRecoilState(paragraphAtom);

    console.log('comments', comments);


    const fetchOperaDetails = useRecoilCallback(({ set }) => async (id) => {
        try {
            const responseOpera = await fetchOpera(id);
            const responseBooks = await fetchBooksByOpera(id);
            //const responseAuthors = await fetchAllAuthorByOpera(id);
            //const responseEditions = await fetchAllEditionByOpera(id);
    
            set(operaDetailsAtom, { 
                ...responseOpera.data,
                books: [...responseBooks.data],
                //editions: [...responseAuthors.data],
                //authors: [...responseEditions.data]
            });
        } catch(e) {
            return toast.error("Unable to upload the work. Please contact the administration!");
        }
    });
    
    useEffect(() => {
        initialLoad();
    }, [id, paramIdBook, paramIdChapter, paramIdParagraph]);

    useEffect(() => {
        console.log('paragraphs', paragraphs)
    }, [paragraphs]);

    useEffect(() => {
        setParapraghId(0);
        setParagraphFilter({
            idOpera: id,
            idBook: bookId,
            idChapter: chapterId,
        })
        setCommentFilter({
            idOpera: id,
            idBook: bookId,
            idChapter: chapterId,
            filter: null 
        })
    }, [chapterId, bookId])

    const initialLoad = () => {
        fetchOperaDetails(id);
        setBookId(paramIdBook || 1);
        setChapterId(paramIdChapter || 1);
    }

    const handleSelectBook = useCallback((e) => {
        setBookId(e.target.value);
        setChapterId(1);
    })

    const handleSelectChapter = useCallback((e, value) => {
        setChapterId(value);
    })

    const downloadParagraphTxtFile = (chapterId, paragraphs = []) => {
        if(!chapterId || !paragraphs || paragraphs.length === 0) {
            return;
        }

        const element = document.createElement("a");
        const textParagraph = paragraphs.map(({ text }) => (text));
        const file = new Blob([textParagraph.join(`\n\n`)], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `${chapterId}.txt`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    const handleCommentParagraph = (id) => {
        setParapraghId(id);
    }

    const serachCommentByFilter = (username = "", tags = []) => {
        setCommentFilter({
            idOpera: id,
            idBook: bookId,
            idChapter: chapterId,
            filter: {
                user: username,
                tags: [...tags]
            } 
        })
    }

    const handleUpdateComment = (commentOnPassed) => {
        if(!commentOnPassed) return;

        console.log('commentOnPassed', commentOnPassed)

        setCommentUpdate({ ...commentOnPassed });
    }

    return (
        <Grid
            container
            direction="row"
            spacing={2} >
            {authorSelected && (
                <FullScreenDialog 
                    title={`Author Details`}
                    open={authorSelected}
                    setOpen={() => setAuthorSelected(null)} >
                    <AuthorDetails author={authorSelected} />
                </FullScreenDialog>
            )}
            {editionSelected && (
                <FullScreenDialog 
                    title={`Edition Details`}
                    open={editionSelected}
                    setOpen={() => setEditionSelected(null)} >
                    <EditionDetails edition={editionSelected} />
                </FullScreenDialog>
            )}
            <Grid item xs={6}>
                <SelectBook 
                    books={books} 
                    value={bookId} 
                    handleSelect={handleSelectBook} />
            </Grid>
            <Grid item xs={2} />
            {id && bookId && chapterId && 
                (<Grid item xs={4}>
                    <BasicMenu title="Actions" items={itemsMenu} sx={{ float: "right" }} />
                </Grid>)
            }
            <Grid item xs={12}>
                <FormGroup sx={{ float: "right" }}>
                    <FormControlLabel
                        label="Synchronized scroll"
                        control={
                            <Switch 
                                disabled={!comments || comments.length === 0}
                                color="secondary"
                                checked={isSyncTextComment} 
                                onChange={e => setIsSyncTextComment(e.target.checked)} />}
                    />
                </FormGroup>
            </Grid>
            <Grid item xs={12}>
                <FilteredComment handleSave={serachCommentByFilter} />
            </Grid>
            <Grid item xs={12} md={8}>
                <Paper style={{ height: 550, marginTop: 15 }}>
                    <ChapterTabs
                        chapters={chaptersOfBook}
                        paragraphs={paragraphs}
                        value={chapterId} 
                        handleSelect={handleSelectChapter}
                        handleCommentParagraph={handleCommentParagraph} />
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <CommentContainer 
                    comments={comments} 
                    paragraphs={paragraphs} 
                    handleUpdateComment={handleUpdateComment} />
            </Grid>
            {/*<Grid item xs={12} md={6}>
                <CardAuthor authors={authors} handleSelect={(author) => setAuthorSelected(author)} />
            </Grid>
            <Grid item xs={12} md={6}>
                <CardEdition editions={editions} handleSelect={(edition) => setEditionSelected(edition)}/>
            </Grid>*/}
            {authToken && 
                (<Grid item xs={12}>
                    <CommentParagraph 
                        opera={{
                            idOpera: id,
                            idBook: bookId,
                            idChapter: chapterId,
                            idParagraph: paragraphId
                        }}
                        paragraphs={paragraphs} 
                        commentUpdate={commentUpdate} 
                        handleResetUpdateComment={() => setCommentUpdate(null)} />
                </Grid>)}
        </Grid>
    )
}

export default OperaDetailsPage;