package controllers;

import beans.fragmentBean;
import java.util.Vector;

public class fragmentController {

    Vector<fragmentBean> fragments;

    public fragmentController() {
        fragments = new Vector<fragmentBean>();
    }

    public void addFragment(fragmentBean fragment)
    {
        fragments.add(fragment);
    }

    public void addFragment(short section_id, String detail, short section_pos, String vid_text)
    {
        fragmentBean fragment = new fragmentBean();
        fragment.setSectionId(section_id);
        fragment.setDetail(detail);
        fragment.setSectionPosition(section_pos);
        fragment.setVidText(vid_text);

        fragments.add(fragment);
    }

    public fragmentBean getFragment(short id)
    {
        int f;
        fragmentBean fragment = null;

        for (f=0; f < fragments.size() && fragment == null; f++)
        {
            if (fragments.elementAt(f).getSectionId() == id)
            {
                fragment = fragments.elementAt(f);
            }
        }

        return fragment;
    }
    
    
}