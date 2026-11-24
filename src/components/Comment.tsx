import type { ReactNode } from 'react';
import { Avatar } from './Media';
import { Button } from './Button';
import { TextArea, type TextAreaProps } from './TextArea';
import { cx } from '../utils';
import './Comment.css';

export interface CommentProps {
  author: ReactNode;
  date?: ReactNode;
  /** Muted time after the date. */
  time?: ReactNode;
  avatar?: string;
  /** Header buttons on the right: attach, more. */
  actions?: ReactNode;
  /** The comment text, drawn in a white bubble. Leave it out when `editor` is given. */
  children?: ReactNode;
  /** Highlights the bubble with a 1px Eerie Black border (the comment being replied to). */
  active?: boolean;
  /** Under the bubble: attachment Tags and the reply button. */
  footer?: ReactNode;
  /** In place of the bubble, e.g. a CommentEditor. */
  editor?: ReactNode;
  /** CommentReply items, joined to the avatar by the thread line. */
  replies?: ReactNode;
  className?: string;
}

/**
 * A comment from the record drawer: 24px avatar, author (ABC Favorit Expanded Medium 12), date and muted
 * time, the text in a white 8px bubble, then attachments, the reply button and the replies thread.
 */
export function Comment({ author, date, time, avatar, actions, children, active, footer, editor, replies, className }: CommentProps) {
  return (
    <article className={cx('syn-comment', Boolean(replies) && 'has-replies', className)}>
      <header className="syn-comment__head">
        <Avatar src={avatar} />
        <span className="syn-comment__author">{author}</span>
        {date && <span className="syn-comment__date">{date}</span>}
        {time && <span className="syn-comment__time">{time}</span>}
        {actions && <span className="syn-comment__actions">{actions}</span>}
      </header>
      <div className="syn-comment__body">
        {editor ?? <div className={cx('syn-comment__bubble', active && 'is-active')}>{children}</div>}
        {footer && <div className="syn-comment__footer">{footer}</div>}
      </div>
      {replies && <ul className="syn-comment__replies">{replies}</ul>}
    </article>
  );
}

export interface CommentReplyProps {
  avatar?: string;
  /** A collapsed reply's first line, or an editor. */
  children: ReactNode;
  /** Right side, e.g. the "12 Replies" button. */
  end?: ReactNode;
  className?: string;
}

/** One reply in a thread: a 24px avatar on the branch line, then its text or an editor. */
export function CommentReply({ avatar, children, end, className }: CommentReplyProps) {
  return (
    <li className={cx('syn-comment-reply', className)}>
      <Avatar src={avatar} />
      <div className="syn-comment-reply__content">{children}</div>
      {end && <div className="syn-comment-reply__end">{end}</div>}
    </li>
  );
}

export interface CommentEditorProps extends Omit<TextAreaProps, 'label'> {
  label?: string;
  onSave?: () => void;
  onDiscard?: () => void;
  saveLabel?: string;
  discardLabel?: string;
}

/** Text area with "Discard" (text button) on the left and the Amber "Save" button on the right. */
export function CommentEditor({
  label = 'Comment', onSave, onDiscard, saveLabel = 'Save', discardLabel = 'Discard', variant = 'strong', className, ...rest
}: CommentEditorProps) {
  return (
    <div className={cx('syn-comment-editor', className)}>
      <TextArea label={label} variant={variant} {...rest} />
      <div className="syn-comment-editor__actions">
        <Button variant="text" onClick={onDiscard}>{discardLabel}</Button>
        {onSave && <Button variant="accent" size="sm" onClick={onSave} className="syn-comment-editor__save">{saveLabel}</Button>}
      </div>
    </div>
  );
}
