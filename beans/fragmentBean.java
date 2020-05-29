package beans;

public class fragmentBean {
    short sectionId;
    String detail;
    short sectionPosition;
    String vidText;

    public fragmentBean() {
        sectionId = 0;
        detail = "";
        sectionPosition = 0;
        vidText = ""; 
    }

    public short getSectionId() {
        return sectionId;
    }

    public void setSectionId(short sectionId) {
        this.sectionId = sectionId;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public short getSectionPosition() {
        return sectionPosition;
    }

    public void setSectionPosition(short sectionPosition) {
        this.sectionPosition = sectionPosition;
    }

    public String getVidText() {
        return vidText;
    }

    public void setVidText(String vidText) {
        this.vidText = vidText;
    }

}