import "./HeadingGroup.scss";

type HeadingGroupProps = {
  title: string;
  subtitle?: string;
};

export const HeadingGroup = ({ title, subtitle }: HeadingGroupProps) => (
  <header className="HeadingGroup">
    <h1 className="title">{title}</h1>
    <p role="doc-subtitle" className="subtitle">
      {subtitle}
    </p>
  </header>
);
