import CMS from "decap-cms-app";
import type { CmsWidgetControlProps, CmsWidgetPreviewProps } from "decap-cms-core";
import React from "react";
import Vditor from "vditor";
import "vditor/dist/index.css";

type WidgetProps = CmsWidgetControlProps<string>;

interface WidgetState { failed: boolean }

class VditorControl extends React.Component<WidgetProps, WidgetState> {
  private host: HTMLDivElement | null = null;
  private editor: Vditor | null = null;
  private ready = false;
  private mounted = false;
  state = { failed: false };

  componentDidMount() {
    this.mounted = true;
    if (!this.host) return;
    try {
      this.editor = new Vditor(this.host, {
        value: this.props.value ?? "",
        mode: "wysiwyg",
        minHeight: 420,
        cache: { enable: false },
        upload: { accept: "image/*", multiple: false },
        input: (value) => this.props.onChange(value),
        after: () => {
          if (!this.mounted || !this.editor) return;
          this.ready = true;
        },
      });
    } catch (error) {
      console.error("Vditor 初始化失败，切换到 Markdown 文本回退。", error);
      this.setState({ failed: true });
    }
  }

  componentDidUpdate(previousProps: WidgetProps) {
    if (!this.ready || !this.editor || previousProps.value === this.props.value) return;
    const nextValue = this.props.value ?? "";
    if (this.editor.getValue() !== nextValue) this.editor.setValue(nextValue);
  }

  componentWillUnmount() {
    this.mounted = false;
    const editor = this.editor;
    this.editor = null;
    if (!this.ready || !editor) return;
    try {
      editor.destroy();
    } catch (error) {
      console.warn("Vditor 尚未完整初始化，已跳过清理。", error);
    }
  }

  render() {
    if (this.state.failed) {
      return React.createElement("textarea", {
        "aria-label": "Markdown 正文文本回退",
        style: { width: "100%", minHeight: 420 },
        value: this.props.value ?? "",
        onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => this.props.onChange(event.target.value),
      });
    }
    return React.createElement("div", { "aria-label": "Vditor Markdown 编辑器", ref: (node: HTMLDivElement | null) => { this.host = node; } });
  }
}

const VditorPreview = ({ value }: CmsWidgetPreviewProps<string>) => React.createElement("pre", { style: { whiteSpace: "pre-wrap" } }, value ?? "");

CMS.registerWidget("vditor", VditorControl, VditorPreview);
CMS.init();
