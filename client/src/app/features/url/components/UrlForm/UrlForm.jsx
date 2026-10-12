import { Link as LinkIcon, ArrowRight, Loader2, Clipboard, X } from 'lucide-react';
import { useShortenForm } from '../../hooks/index.js';
import './UrlForm.scss';

export const UrlForm = () => {
    const { formData, formErrors, submitting, handleChange, handlePaste, handleSubmit, resetForm } =
        useShortenForm();

    return (
        <div className="url-form-container">
            <div className="url-form-header">
                <h2 className="form-title">Shorten a new link</h2>
                <p className="form-subtitle">
                    Enter any long URL to create a collision-resistant, tracked short link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="url-form" noValidate>
                <div className={`input-group-main ${formErrors.url ? 'has-error' : ''}`}>
                    <span className="input-icon">
                        <LinkIcon size={18} />
                    </span>

                    <input
                        type="url"
                        className="main-url-input"
                        placeholder="https://example.com/very-long-article-url..."
                        value={formData.url}
                        onChange={(e) => handleChange('url', e.target.value)}
                        autoComplete="off"
                        spellCheck="false"
                        disabled={submitting}
                    />

                    <div className="input-actions">
                        {formData.url ? (
                            <button
                                type="button"
                                className="clear-btn"
                                onClick={() => handleChange('url', '')}
                                title="Clear URL"
                                aria-label="Clear input"
                            >
                                <X size={14} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="paste-btn"
                                onClick={handlePaste}
                                title="Paste from clipboard"
                            >
                                <Clipboard size={13} />
                                <span>Paste</span>
                            </button>
                        )}
                    </div>
                </div>

                {formErrors.url && <div className="field-error">{formErrors.url}</div>}

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting || !formData.url.trim()}
                >
                    {submitting ? (
                        <>
                            <Loader2 size={16} className="spinner" />
                            <span>Generating Short Link...</span>
                        </>
                    ) : (
                        <>
                            <span>Shorten Link</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default UrlForm;
