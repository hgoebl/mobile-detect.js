<?php
require_once dirname(__FILE__).'/../../Mobile-Detect/Mobile_Detect.php';

class Mobile_Detect_Exporter extends Mobile_Detect {

    public function export()
    {
        $detect_data = array(
            'phones' => parent::$phoneDevices,
            'tablets' => parent::$tabletDevices,
            'oss' => parent::$operatingSystems,
            'uas' => parent::$browsers,
            'props' => parent::$properties,
            'utils' => parent::$utilities
        );
        print json_encode($detect_data, JSON_PRETTY_PRINT);
    }
}

$exp = new Mobile_Detect_Exporter();

$exp->export();