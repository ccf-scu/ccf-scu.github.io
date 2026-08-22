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
  state = { failed: false };

  componentDidMount() {
    if (!this.host) return;
    try {
      this.editor = new Vditor(this.host, {
        value: this.props.value ?? "",
        mode: "wysiwyg",
        minHeight: 420,
        cache: { enable: false },
        upload: { accept: "image/*", multiple: false },
        input: (value) => this.props.onChange(value),
        after: () => this.editor?.focus(),
      });
    } catch (error) {
      console.error("Vditor 初始化失败，切换到 Markdown 文本回退。", error);
      this.setState({ failed: true });
    }
  }

  componentWillUnmount() { this.editor?.destroy(); }

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
