import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import _ from "lodash";
import {
    apiGetAppContent,
    apiSaveAppDisplayContent,
} from "../../../../services/AppDisplayContentServices";
import AppLogoLoader from "../../../../components/shared/AppLogoLoader";
import PageTitle from "../../../../components/ui/PageTitle/PageTitle";
import CardContainer from "../../../../components/shared/CardContainer";
import FormLabel from "../../../../components/ui/FormLabel";
import Button from "../../../../components/ui/Button/Button";

const AppDisplayContent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [appContentData, setAppContentData] = useState({
        about_us: "",
        terms_conditions: "",
        privacy_policy: "",
    });

    const getAppDisplayContent = async () => {
        try {
            setIsLoading(true);
            const response = await apiGetAppContent();

            console.log('API Response:', response);

            if (response?.data?.success) {
                const data = response.data.data;

                console.log('Received HTML data:', {
                    about_us: data.about_us,
                    terms_conditions: data.terms_conditions,
                    privacy_policy: data.privacy_policy
                });

                setAppContentData({
                    about_us: data.about_us || "",
                    terms_conditions: data.terms_conditions || "",
                    privacy_policy: data.privacy_policy || "",
                });
            }
        } catch (error) {
            console.error("Get app content error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAppDisplayContent();
    }, []);

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const handleFormSubmit = async (values, { setSubmitting }) => {
        try {
            setSubmitting(true);
            
            // Get HTML content from editors
            const aboutUsHtml = document.getElementById('about-us-editor')?.innerHTML || '';
            const termsHtml = document.getElementById('terms-editor')?.innerHTML || '';
            const privacyHtml = document.getElementById('privacy-editor')?.innerHTML || '';
            
            console.log('Sending HTML data:', {
                about_us: aboutUsHtml,
                terms_conditions: termsHtml,
                privacy_policy: privacyHtml
            });
            
            // Create FormData object to send as multipart/form-data
            const formData = new FormData();
            formData.append('about_us', aboutUsHtml);
            formData.append('terms_conditions', termsHtml);
            formData.append('privacy_policy', privacyHtml);
            
            const response = await apiSaveAppDisplayContent(formData);
            console.log('Save response:', response);
            
            // Refresh data after save
            await getAppDisplayContent();
        } catch (error) {
            console.error("Save app content error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const Toolbar = ({ editorId }) => {
        const applyFormat = (command, value = null) => {
            const editor = document.getElementById(editorId);
            if (!editor) return;
            
            editor.focus();
            
            // Get the selection
            const selection = window.getSelection();
            if (!selection.rangeCount) {
                // If no selection, create one at the end of the editor
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            
            document.execCommand(command, false, value);
            editor.focus();
        };

        const insertImage = (e) => {
            e.preventDefault();
            const editor = document.getElementById(editorId);
            if (!editor) return;
            
            editor.focus();
            
            // Create file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            fileInput.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        
                        // Insert image at cursor position
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            range.insertNode(img);
                            
                            // Move cursor after image
                            range.setStartAfter(img);
                            range.setEndAfter(img);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        } else {
                            editor.appendChild(img);
                        }
                        
                        editor.focus();
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            fileInput.click();
        };

        const insertLink = (e) => {
            e.preventDefault();
            const url = prompt('Enter link URL:');
            if (url) {
                applyFormat('createLink', url);
            }
        };

        const handleMouseDown = (e) => {
            // Prevent button click from removing focus from editor
            e.preventDefault();
        };

        return (
            <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border border-gray-300 rounded-t-lg">
                <select 
                    onChange={(e) => {
                        if (e.target.value) {
                            applyFormat('formatBlock', e.target.value);
                        }
                        e.target.value = '';
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm bg-white cursor-pointer"
                    value=""
                >
                    <option value="">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="h5">Heading 5</option>
                    <option value="h6">Heading 6</option>
                </select>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('bold')}
                    className="px-3 py-1 font-bold border border-gray-300 rounded hover:bg-gray-200"
                    title="Bold"
                >
                    B
                </button>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('italic')}
                    className="px-3 py-1 italic border border-gray-300 rounded hover:bg-gray-200"
                    title="Italic"
                >
                    I
                </button>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('underline')}
                    className="px-3 py-1 underline border border-gray-300 rounded hover:bg-gray-200"
                    title="Underline"
                >
                    U
                </button>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('strikeThrough')}
                    className="px-3 py-1 line-through border border-gray-300 rounded hover:bg-gray-200"
                    title="Strike"
                >
                    S
                </button>

                <div className="w-px bg-gray-300 mx-1"></div>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('insertOrderedList')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                    title="Numbered List"
                >
                    1. 2. 3.
                </button>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('insertUnorderedList')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
                    title="Bullet List"
                >
                    • • •
                </button>

                <div className="w-px bg-gray-300 mx-1"></div>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('justifyLeft')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
                    title="Align Left"
                >
                    ⬅
                </button>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('justifyCenter')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
                    title="Align Center"
                >
                    ↔
                </button>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={() => applyFormat('justifyRight')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
                    title="Align Right"
                >
                    ➡
                </button>

                <div className="w-px bg-gray-300 mx-1"></div>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={insertLink}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
                    title="Insert Link"
                >
                    🔗
                </button>

                <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onClick={insertImage}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200"
                    title="Insert Image"
                >
                    🖼️
                </button>

                <div className="w-px bg-gray-300 mx-1"></div>

                <input
                    type="color"
                    onChange={(e) => applyFormat('foreColor', e.target.value)}
                    onMouseDown={handleMouseDown}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    title="Text Color"
                />

                <input
                    type="color"
                    onChange={(e) => applyFormat('backColor', e.target.value)}
                    onMouseDown={handleMouseDown}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    title="Background Color"
                />
            </div>
        );
    };

    useEffect(() => {
        // Set HTML content to editors when data is loaded
        if (appContentData.about_us) {
            const aboutEditor = document.getElementById('about-us-editor');
            if (aboutEditor) {
                aboutEditor.innerHTML = appContentData.about_us;
                console.log('Set About Us HTML:', appContentData.about_us);
            }
        }
        if (appContentData.terms_conditions) {
            const termsEditor = document.getElementById('terms-editor');
            if (termsEditor) {
                termsEditor.innerHTML = appContentData.terms_conditions;
                console.log('Set Terms HTML:', appContentData.terms_conditions);
            }
        }
        if (appContentData.privacy_policy) {
            const privacyEditor = document.getElementById('privacy-editor');
            if (privacyEditor) {
                privacyEditor.innerHTML = appContentData.privacy_policy;
                console.log('Set Privacy HTML:', appContentData.privacy_policy);
            }
        }
    }, [appContentData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <AppLogoLoader />
            </div>
        );
    }

    return (
        <div className="px-4 py-5 sm:p-6 lg:p-7 2xl:p-10 min-h-[calc(100vh-85px)]">
            <PageTitle title="App Display Content" />

            <CardContainer className="p-4 mt-5">
                <Formik
                    enableReinitialize
                    initialValues={appContentData}
                    onSubmit={handleFormSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="grid grid-cols-1 gap-5">
                            <div className="flex flex-col gap-5 mb-6 sm:mb-[60px]">
                                {/* About Us Editor */}
                                <div className="w-full">
                                    <FormLabel htmlFor="about_us">About Us</FormLabel>
                                    <div className="border border-[#8D8D8D] rounded-lg shadow-[-4px_4px_6px_0px_#0000001F] overflow-hidden">
                                        <Toolbar editorId="about-us-editor" />
                                        <div
                                            id="about-us-editor"
                                            contentEditable={true}
                                            className="p-4 bg-white focus:outline-none [&_img]:max-w-full [&_img]:h-auto [&_img]:my-2"
                                            style={{ minHeight: '300px' }}
                                        />
                                    </div>
                                </div>

                                {/* Terms & Conditions Editor */}
                                <div className="w-full">
                                    <FormLabel htmlFor="terms_conditions">Terms & Conditions</FormLabel>
                                    <div className="border border-[#8D8D8D] rounded-lg shadow-[-4px_4px_6px_0px_#0000001F] overflow-hidden">
                                        <Toolbar editorId="terms-editor" />
                                        <div
                                            id="terms-editor"
                                            contentEditable={true}
                                            className="p-4 bg-white focus:outline-none [&_img]:max-w-full [&_img]:h-auto [&_img]:my-2"
                                            style={{ minHeight: '300px' }}
                                        />
                                    </div>
                                </div>

                                {/* Privacy Policy Editor */}
                                <div className="w-full">
                                    <FormLabel htmlFor="privacy_policy">Privacy Policy</FormLabel>
                                    <div className="border border-[#8D8D8D] rounded-lg shadow-[-4px_4px_6px_0px_#0000001F] overflow-hidden">
                                        <Toolbar editorId="privacy-editor" />
                                        <div
                                            id="privacy-editor"
                                            contentEditable={true}
                                            className="p-4 bg-white focus:outline-none [&_img]:max-w-full [&_img]:h-auto [&_img]:my-2"
                                            style={{ minHeight: '300px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-end">
                                <Button
                                    btnType="submit"
                                    btnSize="md"
                                    type="filled"
                                    className="!px-10 pt-4 pb-[15px] leading-[25px] w-full sm:w-auto"
                                    disabled={isSubmitting}
                                >
                                    <span>SAVE</span>
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </CardContainer>
        </div>
    );
};

export default AppDisplayContent;