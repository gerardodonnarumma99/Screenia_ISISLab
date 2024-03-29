import InfoIcon from '@mui/icons-material/Info';
import {
    Autocomplete,
    TextField,
    Tooltip
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchTags } from '../../api/opereApi';

const TagAutocomplete = ({ value = [], handleSelect = null, readOnly = false }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [tagsOptions, setTagsOptions] = useState([]);

    useEffect(() => { 
        getTags();
    }, []);

    const getTags = async () => {

        try {
            setIsLoading(true);
            const response = await fetchTags();
            let options = [];

            if(response.data && response.data.length > 0) {
                options = [...response.data]
            }

            setTagsOptions(options);
        } catch(e) {
            toast.error("Impossibile recuperare i Tag. Contattare l'amministrazione!")
        } finally {
            setIsLoading(false);
        }
    }

    const onChangeTag = useCallback((e, value) => {
        if(!value) return;

        handleSelect(value);
    })

    return (
        <Autocomplete
            multiple
            id="tags-comment"
            value={value}
            noOptionsText="There is no tag present!"
            options={tagsOptions.sort((a, b) => -b.category.localeCompare(a.category))}
            getOptionLabel={(option) => option.title}
            onChange={onChangeTag}
            style={{ maxWidth: 583 }}
            getOptionDisabled={(option) => {
                if(option.disabled) return true;

                return false;
            }}
            disabled={readOnly}
            filterSelectedOptions
            isOptionEqualToValue={(option, value) => option.title === value.title}
            groupBy={(option) => option.category}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Tags"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                        <>
                            {isLoading ? <CircularProgress color="primary" size={20} /> : null}
                            {params.InputProps.endAdornment}
                        </>
                        ),
                    }} />
            )}
            renderOption={(props, option, { selected }) => {
                return (
                    <li {...props}>
                        <Tooltip title={`${option.description ? option.description : ""}`}>
                            <InfoIcon style={{ marginRight: 5 }} color="secondary" />
                        </Tooltip>
                        {option.title}
                    </li>
                )
            }}
        />
    )
}

export default TagAutocomplete;