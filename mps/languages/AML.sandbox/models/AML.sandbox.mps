<?xml version="1.0" encoding="UTF-8"?>
<model ref="r:e7604a7e-733e-4355-809b-786743980341(AML.sandbox)">
  <persistence version="9" />
  <languages>
    <use id="292b2b71-dc8d-4e66-9cda-de3a826a9e55" name="AML" version="0" />
  </languages>
  <imports />
  <registry>
    <language id="ceab5195-25ea-4f22-9b92-103b95ca8c0c" name="jetbrains.mps.lang.core">
      <concept id="1169194658468" name="jetbrains.mps.lang.core.structure.INamedConcept" flags="ngI" index="TrEIO">
        <property id="1169194664001" name="name" index="TrG5h" />
      </concept>
    </language>
    <language id="292b2b71-dc8d-4e66-9cda-de3a826a9e55" name="AML">
      <concept id="1624465643281312461" name="AML.structure.Transition" flags="ng" index="174awC">
        <property id="1624465643281312462" name="status" index="174awF" />
        <reference id="1624465643281312463" name="sensor" index="174awE" />
        <reference id="1624465643281312464" name="target" index="174awP" />
      </concept>
      <concept id="1624465643281312465" name="AML.structure.Action" flags="ng" index="174awO">
        <property id="1624465643281312466" name="status" index="174awR" />
        <reference id="1624465643281312467" name="actuator" index="174awQ" />
      </concept>
      <concept id="1624465643281312322" name="AML.structure.State" flags="ng" index="174ayB">
        <child id="1624465643281312325" name="transitions" index="174ayw" />
        <child id="1624465643281312324" name="actions" index="174ayx" />
      </concept>
      <concept id="1624465643280654125" name="AML.structure.Brick" flags="ng" index="176DR8">
        <property id="1624465643280654127" name="pin" index="176DRa" />
      </concept>
      <concept id="1624465643280654124" name="AML.structure.App" flags="ng" index="176DR9">
        <reference id="1624465643281312498" name="init_state" index="174awn" />
        <child id="1624465643281312497" name="state" index="174awk" />
        <child id="1624465643280654131" name="bricks" index="176DRm" />
      </concept>
      <concept id="1624465643280654129" name="AML.structure.Actuator" flags="ng" index="176DRk" />
      <concept id="1624465643280654130" name="AML.structure.Sensor" flags="ng" index="176DRn" />
    </language>
  </registry>
  <node concept="176DR9" id="1qbgIlh$uur">
    <property role="TrG5h" value="RedButton" />
    <ref role="174awn" node="1qbgIlhB5UO" resolve="off" />
    <node concept="174ayB" id="1qbgIlhB5UO" role="174awk">
      <property role="TrG5h" value="off" />
      <node concept="174awO" id="1qbgIlhB5UQ" role="174ayx">
        <property role="174awR" value="1qbgIlhAYFc/false" />
        <ref role="174awQ" node="1qbgIlh$uus" resolve="red_led" />
      </node>
      <node concept="174awC" id="1qbgIlhB5UP" role="174ayw">
        <property role="174awF" value="1qbgIlhAYFb/true" />
        <ref role="174awE" node="1qbgIlh$uuu" resolve="button" />
        <ref role="174awP" node="1qbgIlhB5UR" resolve="on" />
      </node>
    </node>
    <node concept="174ayB" id="1qbgIlhB5UR" role="174awk">
      <property role="TrG5h" value="on" />
      <node concept="174awO" id="1qbgIlhB5UT" role="174ayx">
        <property role="174awR" value="1qbgIlhAYFb/true" />
        <ref role="174awQ" node="1qbgIlh$uus" resolve="red_led" />
      </node>
      <node concept="174awC" id="1qbgIlhB5US" role="174ayw">
        <property role="174awF" value="1qbgIlhAYFb/true" />
        <ref role="174awE" node="1qbgIlh$uuu" resolve="button" />
        <ref role="174awP" node="1qbgIlhB5UO" resolve="off" />
      </node>
    </node>
    <node concept="176DRk" id="1qbgIlh$uus" role="176DRm">
      <property role="TrG5h" value="red_led" />
      <property role="176DRa" value="12" />
    </node>
    <node concept="176DRn" id="1qbgIlh$uuu" role="176DRm">
      <property role="TrG5h" value="button" />
      <property role="176DRa" value="8" />
    </node>
  </node>
</model>

