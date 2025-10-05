'use client';

import {
  ActionIcon,
  Flex,
  Group,
  Input,
  MantineTheme,
  Menu,
  useMantineTheme,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { RichTextEditor as RichTextEditorBase } from '@mantine/tiptap';
import { IconChevronDown } from '@tabler/icons-react';
import Highlight from '@tiptap/extension-highlight';
import SubScript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ReactNode, useEffect } from 'react';

// Helper to convert em values to pixels
function emToPx(em: string, theme: MantineTheme) {
  return parseFloat(em) * parseFloat(theme.fontSizes.md);
}

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: ReactNode;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  error,
  ...props
}: RichTextEditorProps & Record<string, unknown>) {
  const { ref, width } = useElementSize();
  const theme = useMantineTheme();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    immediatelyRender: false,
    content: value ?? '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value ?? '', { emitUpdate: false });
    }
  }, [editor, value]);

  // Show/hide controls based on the container's width, not the viewport's
  const showLink = width > emToPx(theme.breakpoints.xs, theme);
  const showList = width > emToPx(theme.breakpoints.sm, theme);
  const showHeadings = width > emToPx(theme.breakpoints.md, theme);

  return (
    <Input.Wrapper label={label} error={error} {...props}>
      <RichTextEditorBase editor={editor}>
        <RichTextEditorBase.Toolbar sticky stickyOffset={60}>
          <Flex ref={ref} gap="xs" justify="space-between" wrap="nowrap">
            <Group gap="xs" style={{ flex: 1 }} wrap="nowrap">
              <RichTextEditorBase.ControlsGroup>
                <RichTextEditorBase.Bold />
                <RichTextEditorBase.Italic />
                <RichTextEditorBase.Underline />
                <RichTextEditorBase.Strikethrough />
              </RichTextEditorBase.ControlsGroup>

              {showHeadings && (
                <RichTextEditorBase.ControlsGroup>
                  <RichTextEditorBase.H1 />
                  <RichTextEditorBase.H2 />
                  <RichTextEditorBase.H3 />
                  <RichTextEditorBase.H4 />
                </RichTextEditorBase.ControlsGroup>
              )}

              {showList && (
                <RichTextEditorBase.ControlsGroup>
                  <RichTextEditorBase.BulletList />
                  <RichTextEditorBase.OrderedList />
                </RichTextEditorBase.ControlsGroup>
              )}

              {showLink && (
                <RichTextEditorBase.ControlsGroup>
                  <RichTextEditorBase.Link />
                  <RichTextEditorBase.Unlink />
                </RichTextEditorBase.ControlsGroup>
              )}
            </Group>

            <Menu trigger="hover" withArrow>
              <Menu.Target>
                <ActionIcon variant="default">
                  <IconChevronDown size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {!showLink && (
                  <RichTextEditorBase.ControlsGroup>
                    <RichTextEditorBase.Link />
                    <RichTextEditorBase.Unlink />
                  </RichTextEditorBase.ControlsGroup>
                )}
                {!showList && (
                  <RichTextEditorBase.ControlsGroup>
                    <RichTextEditorBase.BulletList />
                    <RichTextEditorBase.OrderedList />
                  </RichTextEditorBase.ControlsGroup>
                )}
                {!showHeadings && (
                  <RichTextEditorBase.ControlsGroup>
                    <RichTextEditorBase.H1 />
                    <RichTextEditorBase.H2 />
                    <RichTextEditorBase.H3 />
                    <RichTextEditorBase.H4 />
                  </RichTextEditorBase.ControlsGroup>
                )}
                <RichTextEditorBase.ControlsGroup>
                  <RichTextEditorBase.Blockquote />
                  <RichTextEditorBase.Hr />
                </RichTextEditorBase.ControlsGroup>
                <RichTextEditorBase.ControlsGroup>
                  <RichTextEditorBase.Subscript />
                  <RichTextEditorBase.Superscript />
                </RichTextEditorBase.ControlsGroup>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </RichTextEditorBase.Toolbar>

        <RichTextEditorBase.Content />
      </RichTextEditorBase>
    </Input.Wrapper>
  );
}
