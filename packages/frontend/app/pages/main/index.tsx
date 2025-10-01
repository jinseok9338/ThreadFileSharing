import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Heading3, BodyTextSmall } from "~/components/typography";
import { useTranslation } from "react-i18next";

export default function MainPage() {
  const { t } = useTranslation();

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Right Chat Content Panel */}
      <ResizablePanel defaultSize={400} minSize={300} maxSize={600}>
        <div className="h-full bg-background">
          <div className="p-4">
            <Heading3 className="text-muted-foreground">
              {t("main.messages")}
            </Heading3>
          </div>
          <div className="flex-1 p-4">
            <div className="text-left">
              <BodyTextSmall className="text-muted-foreground">
                {t("main.selectChatRoom")}
              </BodyTextSmall>
            </div>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle />

      {/* Thread Panel */}
      <ResizablePanel defaultSize={300} minSize={60} maxSize={400}>
        <div className="h-full border-l bg-background">
          <div className="p-4">
            <Heading3 className="text-muted-foreground">
              {t("main.threads")}
            </Heading3>
          </div>
          <div className="flex-1 p-4">
            <div className="text-left">
              <BodyTextSmall className="text-muted-foreground">
                {t("main.noThreads")}
              </BodyTextSmall>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
