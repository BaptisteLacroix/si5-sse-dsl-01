<?xml version="1.0" encoding="UTF-8"?>
<model ref="r:f8976598-03df-4588-93a2-d582e1e9ca11(AML.editor)">
  <persistence version="9" />
  <languages>
    <use id="18bc6592-03a6-4e29-a83a-7ff23bde13ba" name="jetbrains.mps.lang.editor" version="15" />
    <use id="aee9cad2-acd4-4608-aef2-0004f6a1cdbd" name="jetbrains.mps.lang.actions" version="4" />
    <devkit ref="fbc25dd2-5da4-483a-8b19-70928e1b62d7(jetbrains.mps.devkit.general-purpose)" />
  </languages>
  <imports>
    <import index="htms" ref="r:8f6b9f4d-1e5b-4c8f-a071-dbe1371a4767(AML.structure)" implicit="true" />
    <import index="tpck" ref="r:00000000-0000-4000-0000-011c89590288(jetbrains.mps.lang.core.structure)" implicit="true" />
  </imports>
  <registry>
    <language id="18bc6592-03a6-4e29-a83a-7ff23bde13ba" name="jetbrains.mps.lang.editor">
      <concept id="1071666914219" name="jetbrains.mps.lang.editor.structure.ConceptEditorDeclaration" flags="ig" index="24kQdi" />
      <concept id="1106270549637" name="jetbrains.mps.lang.editor.structure.CellLayout_Horizontal" flags="nn" index="2iRfu4" />
      <concept id="1080736578640" name="jetbrains.mps.lang.editor.structure.BaseEditorComponent" flags="ig" index="2wURMF">
        <child id="1080736633877" name="cellModel" index="2wV5jI" />
      </concept>
      <concept id="1139848536355" name="jetbrains.mps.lang.editor.structure.CellModel_WithRole" flags="ng" index="1$h60E">
        <reference id="1140103550593" name="relationDeclaration" index="1NtTu8" />
      </concept>
      <concept id="1073389446423" name="jetbrains.mps.lang.editor.structure.CellModel_Collection" flags="sn" stub="3013115976261988961" index="3EZMnI">
        <child id="1106270802874" name="cellLayout" index="2iSdaV" />
        <child id="1073389446424" name="childCellModel" index="3EZMnx" />
      </concept>
      <concept id="1073389577006" name="jetbrains.mps.lang.editor.structure.CellModel_Constant" flags="sn" stub="3610246225209162225" index="3F0ifn">
        <property id="1073389577007" name="text" index="3F0ifm" />
      </concept>
      <concept id="1073389658414" name="jetbrains.mps.lang.editor.structure.CellModel_Property" flags="sg" stub="730538219796134133" index="3F0A7n" />
      <concept id="1166049232041" name="jetbrains.mps.lang.editor.structure.AbstractComponent" flags="ng" index="1XWOmA">
        <reference id="1166049300910" name="conceptDeclaration" index="1XX52x" />
      </concept>
    </language>
  </registry>
  <node concept="24kQdi" id="1qbgIlh$uuC">
    <ref role="1XX52x" to="htms:1qbgIlh$tWL" resolve="Actuator" />
    <node concept="3EZMnI" id="1qbgIlh$uuY" role="2wV5jI">
      <node concept="2iRfu4" id="1qbgIlh$uuZ" role="2iSdaV" />
      <node concept="3F0ifn" id="1qbgIlh$uv3" role="3EZMnx">
        <property role="3F0ifm" value="actuator" />
      </node>
      <node concept="3F0A7n" id="1qbgIlh$uv6" role="3EZMnx">
        <ref role="1NtTu8" to="tpck:h0TrG11" resolve="name" />
      </node>
      <node concept="3F0ifn" id="1qbgIlh$uvf" role="3EZMnx">
        <property role="3F0ifm" value=":" />
      </node>
      <node concept="3F0A7n" id="1qbgIlh$uvc" role="3EZMnx">
        <ref role="1NtTu8" to="htms:1qbgIlh$tWJ" resolve="pin" />
      </node>
    </node>
  </node>
  <node concept="24kQdi" id="1qbgIlh$CR7">
    <ref role="1XX52x" to="htms:1qbgIlh$tWM" resolve="Sensor" />
    <node concept="3EZMnI" id="1qbgIlh$CRb" role="2wV5jI">
      <node concept="3F0ifn" id="1qbgIlh$CRf" role="3EZMnx">
        <property role="3F0ifm" value="sensor" />
      </node>
      <node concept="2iRfu4" id="1qbgIlh$CRe" role="2iSdaV" />
      <node concept="3F0A7n" id="1qbgIlh$CRi" role="3EZMnx">
        <ref role="1NtTu8" to="tpck:h0TrG11" resolve="name" />
      </node>
      <node concept="3F0ifn" id="1qbgIlh$CRl" role="3EZMnx">
        <property role="3F0ifm" value=":" />
      </node>
      <node concept="3F0A7n" id="1qbgIlh$CRo" role="3EZMnx">
        <ref role="1NtTu8" to="htms:1qbgIlh$tWJ" resolve="pin" />
      </node>
    </node>
  </node>
</model>

