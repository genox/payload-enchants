'use client';

import type { FieldType, Options } from '@payloadcms/ui';
import {
  FieldLabel,
  TextareaInput,
  useAllFormFields,
  useDocumentInfo,
  useField,
  useFieldProps,
  useLocale,
  useTranslation,
} from '@payloadcms/ui';
import type { FormFieldBase } from '@payloadcms/ui/fields/shared';
import React, { useCallback } from 'react';

import { defaults } from '../defaults';
import type { GenerateDescription } from '../types';
import { LengthIndicator } from '../ui/LengthIndicator';

const { maxLength, minLength } = defaults.description;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type MetaDescriptionProps = {
  hasGenerateDescriptionAi: boolean;
  hasGenerateDescriptionFn: boolean;
  path: string;
} & FormFieldBase;

export const MetaDescription: React.FC<MetaDescriptionProps> = (props) => {
  const {
    CustomLabel,
    hasGenerateDescriptionAi,
    hasGenerateDescriptionFn,
    labelProps,
    path,
    required,
  } = props;

  const { path: pathFromContext } = useFieldProps();

  const { t } = useTranslation();

  const locale = useLocale();

  const [fields] = useAllFormFields();

  const docInfo = useDocumentInfo();

  const field: FieldType<string> = useField({
    path,
  } as Options);

  const { errorMessage, setValue, showError, value } = field;

  const regenerateDescription = useCallback(async () => {
    if (!hasGenerateDescriptionFn) return;

    const genDescriptionResponse = await fetch('/api/plugin-seo/generate-description', {
      body: JSON.stringify({
        ...docInfo,
        doc: { ...fields },
        locale: typeof locale === 'object' ? locale?.code : locale,
      } satisfies Parameters<GenerateDescription>[0]),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const { result: generatedDescription } = await genDescriptionResponse.json();

    setValue(generatedDescription || '');
  }, [fields, setValue, hasGenerateDescriptionFn, locale, docInfo]);

  const regenerateDescriptionAi = useCallback(async () => {
    if (!hasGenerateDescriptionAi) return;

    const genDescriptionResponse = await fetch('/api/plugin-seo/generate-description-ai', {
      body: JSON.stringify({
        ...docInfo,
        doc: { ...fields },
        locale: typeof locale === 'object' ? locale?.code : locale,
      } satisfies Parameters<GenerateDescription>[0]),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const { result: generatedDescription } = await genDescriptionResponse.json();

    setValue(generatedDescription || '');
  }, [fields, setValue, hasGenerateDescriptionAi, locale, docInfo]);

  type TArg = Parameters<typeof t>[0];

  return (
    <div
      style={{
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          marginBottom: '5px',
          position: 'relative',
        }}
      >
        <div className='plugin-seo__field'>
          <FieldLabel CustomLabel={CustomLabel} {...(labelProps || {})} />
          {hasGenerateDescriptionFn && (
            <React.Fragment>
              &nbsp; &mdash; &nbsp;
              <button
                onClick={regenerateDescription}
                style={{
                  background: 'none',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'currentcolor',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
                type='button'
              >
                {t('plugin-seo:autoGenerate' as TArg)}
              </button>
            </React.Fragment>
          )}
          {hasGenerateDescriptionAi && (
            <React.Fragment>
              &nbsp; &mdash; &nbsp;
              <button
                onClick={regenerateDescriptionAi}
                style={{
                  background: 'none',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'currentcolor',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
                type='button'
              >
                {t('plugin-seo:generateAi' as TArg)}
              </button>
            </React.Fragment>
          )}
        </div>
        <div
          style={{
            color: '#9A9A9A',
          }}
        >
          {t('plugin-seo:lengthTipDescription' as TArg, { maxLength, minLength })}
          <a
            href='https://developers.google.com/search/docs/advanced/appearance/snippet#meta-descriptions'
            rel='noopener noreferrer'
            target='_blank'
          >
            {t('plugin-seo:bestPractices' as TArg)}
          </a>
        </div>
      </div>
      <div
        style={{
          marginBottom: '10px',
          position: 'relative',
        }}
      >
        <TextareaInput
          CustomError={errorMessage}
          onChange={setValue}
          path={pathFromContext}
          required={required}
          showError={showError}
          style={{
            marginBottom: 0,
          }}
          value={value}
        />
      </div>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          width: '100%',
        }}
      >
        <LengthIndicator maxLength={maxLength} minLength={minLength} text={value} />
      </div>
    </div>
  );
};
