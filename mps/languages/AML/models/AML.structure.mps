<?xml version="1.0" encoding="UTF-8"?>
<model ref="r:8f6b9f4d-1e5b-4c8f-a071-dbe1371a4767(AML.structure)">
  <persistence version="9" />
  <languages>
    <devkit ref="78434eb8-b0e5-444b-850d-e7c4ad2da9ab(jetbrains.mps.devkit.aspect.structure)" />
  </languages>
  <imports>
    <import index="tpck" ref="r:00000000-0000-4000-0000-011c89590288(jetbrains.mps.lang.core.structure)" implicit="true" />
    <import index="4fqr" ref="r:fa713d69-08ea-4732-b1f2-cb07f9e103ef(jetbrains.mps.execution.util.structure)" implicit="true" />
  </imports>
  <registry>
    <language id="c72da2b9-7cce-4447-8389-f407dc1158b7" name="jetbrains.mps.lang.structure">
      <concept id="3348158742936976480" name="jetbrains.mps.lang.structure.structure.EnumerationMemberDeclaration" flags="ng" index="25R33">
        <property id="1421157252384165432" name="memberId" index="3tVfz5" />
        <property id="672037151186491528" name="presentation" index="1L1pqM" />
      </concept>
      <concept id="3348158742936976479" name="jetbrains.mps.lang.structure.structure.EnumerationDeclaration" flags="ng" index="25R3W">
        <child id="3348158742936976577" name="members" index="25R1y" />
      </concept>
      <concept id="1082978164218" name="jetbrains.mps.lang.structure.structure.DataTypeDeclaration" flags="ng" index="AxPO6">
        <property id="7791109065626895363" name="datatypeId" index="3F6X1D" />
      </concept>
      <concept id="1169125787135" name="jetbrains.mps.lang.structure.structure.AbstractConceptDeclaration" flags="ig" index="PkWjJ">
        <property id="6714410169261853888" name="conceptId" index="EcuMT" />
        <property id="4628067390765956802" name="abstract" index="R5$K7" />
        <child id="1071489727083" name="linkDeclaration" index="1TKVEi" />
        <child id="1071489727084" name="propertyDeclaration" index="1TKVEl" />
      </concept>
      <concept id="1169127622168" name="jetbrains.mps.lang.structure.structure.InterfaceConceptReference" flags="ig" index="PrWs8">
        <reference id="1169127628841" name="intfc" index="PrY4T" />
      </concept>
      <concept id="1071489090640" name="jetbrains.mps.lang.structure.structure.ConceptDeclaration" flags="ig" index="1TIwiD">
        <property id="1096454100552" name="rootable" index="19KtqR" />
        <reference id="1071489389519" name="extends" index="1TJDcQ" />
        <child id="1169129564478" name="implements" index="PzmwI" />
      </concept>
      <concept id="1071489288299" name="jetbrains.mps.lang.structure.structure.PropertyDeclaration" flags="ig" index="1TJgyi">
        <property id="241647608299431129" name="propertyId" index="IQ2nx" />
        <reference id="1082985295845" name="dataType" index="AX2Wp" />
      </concept>
      <concept id="1071489288298" name="jetbrains.mps.lang.structure.structure.LinkDeclaration" flags="ig" index="1TJgyj">
        <property id="1071599776563" name="role" index="20kJfa" />
        <property id="1071599893252" name="sourceCardinality" index="20lbJX" />
        <property id="1071599937831" name="metaClass" index="20lmBu" />
        <property id="241647608299431140" name="linkId" index="IQ2ns" />
        <reference id="1071599976176" name="target" index="20lvS9" />
      </concept>
    </language>
    <language id="ceab5195-25ea-4f22-9b92-103b95ca8c0c" name="jetbrains.mps.lang.core">
      <concept id="1169194658468" name="jetbrains.mps.lang.core.structure.INamedConcept" flags="ngI" index="TrEIO">
        <property id="1169194664001" name="name" index="TrG5h" />
      </concept>
    </language>
  </registry>
  <node concept="1TIwiD" id="1qbgIlh$tWG">
    <property role="EcuMT" value="1624465643280654124" />
    <property role="TrG5h" value="App" />
    <property role="19KtqR" value="true" />
    <ref role="1TJDcQ" to="tpck:gw2VY9q" resolve="BaseConcept" />
    <node concept="1TJgyj" id="1qbgIlh$tWN" role="1TKVEi">
      <property role="IQ2ns" value="1624465643280654131" />
      <property role="20lmBu" value="fLJjDmT/aggregation" />
      <property role="20kJfa" value="bricks" />
      <property role="20lbJX" value="fLJekj5/_0__n" />
      <ref role="20lvS9" node="1qbgIlh$tWH" resolve="Brick" />
    </node>
    <node concept="1TJgyj" id="1qbgIlhAYFL" role="1TKVEi">
      <property role="IQ2ns" value="1624465643281312497" />
      <property role="20lmBu" value="fLJjDmT/aggregation" />
      <property role="20kJfa" value="state" />
      <property role="20lbJX" value="fLJekj6/_1__n" />
      <ref role="20lvS9" node="1qbgIlhAYD2" resolve="State" />
    </node>
    <node concept="PrWs8" id="1qbgIlh$Kd3" role="PzmwI">
      <ref role="PrY4T" to="4fqr:431DWIovi3l" resolve="IMainClass" />
    </node>
    <node concept="PrWs8" id="1qbgIlhAYFK" role="PzmwI">
      <ref role="PrY4T" to="tpck:h0TrEE$" resolve="INamedConcept" />
    </node>
    <node concept="1TJgyj" id="1qbgIlhAYFM" role="1TKVEi">
      <property role="IQ2ns" value="1624465643281312498" />
      <property role="20kJfa" value="init_state" />
      <property role="20lbJX" value="fLJekj4/_1" />
      <ref role="20lvS9" node="1qbgIlhAYD2" resolve="State" />
    </node>
  </node>
  <node concept="1TIwiD" id="1qbgIlh$tWH">
    <property role="EcuMT" value="1624465643280654125" />
    <property role="TrG5h" value="Brick" />
    <property role="R5$K7" value="true" />
    <ref role="1TJDcQ" to="tpck:gw2VY9q" resolve="BaseConcept" />
    <node concept="PrWs8" id="1qbgIlh$tWI" role="PzmwI">
      <ref role="PrY4T" to="tpck:h0TrEE$" resolve="INamedConcept" />
    </node>
    <node concept="1TJgyi" id="1qbgIlh$tWJ" role="1TKVEl">
      <property role="IQ2nx" value="1624465643280654127" />
      <property role="TrG5h" value="pin" />
      <ref role="AX2Wp" to="tpck:fKAQMTA" resolve="integer" />
    </node>
  </node>
  <node concept="1TIwiD" id="1qbgIlh$tWL">
    <property role="EcuMT" value="1624465643280654129" />
    <property role="TrG5h" value="Actuator" />
    <ref role="1TJDcQ" node="1qbgIlh$tWH" resolve="Brick" />
  </node>
  <node concept="1TIwiD" id="1qbgIlh$tWM">
    <property role="EcuMT" value="1624465643280654130" />
    <property role="TrG5h" value="Sensor" />
    <ref role="1TJDcQ" node="1qbgIlh$tWH" resolve="Brick" />
  </node>
  <node concept="1TIwiD" id="1qbgIlhAYD2">
    <property role="EcuMT" value="1624465643281312322" />
    <property role="TrG5h" value="State" />
    <ref role="1TJDcQ" to="tpck:gw2VY9q" resolve="BaseConcept" />
    <node concept="PrWs8" id="1qbgIlhAYD3" role="PzmwI">
      <ref role="PrY4T" to="tpck:h0TrEE$" resolve="INamedConcept" />
    </node>
    <node concept="1TJgyj" id="1qbgIlhAYD4" role="1TKVEi">
      <property role="IQ2ns" value="1624465643281312324" />
      <property role="20lmBu" value="fLJjDmT/aggregation" />
      <property role="20kJfa" value="actions" />
      <property role="20lbJX" value="fLJekj5/_0__n" />
      <ref role="20lvS9" node="1qbgIlhAYFh" resolve="Action" />
    </node>
    <node concept="1TJgyj" id="1qbgIlhAYD5" role="1TKVEi">
      <property role="IQ2ns" value="1624465643281312325" />
      <property role="20lmBu" value="fLJjDmT/aggregation" />
      <property role="20kJfa" value="transitions" />
      <property role="20lbJX" value="fLJekj4/_1" />
      <ref role="20lvS9" node="1qbgIlhAYFd" resolve="Transition" />
    </node>
  </node>
  <node concept="25R3W" id="1qbgIlhAYFa">
    <property role="3F6X1D" value="1624465643281312458" />
    <property role="TrG5h" value="STATUS" />
    <node concept="25R33" id="1qbgIlhAYFb" role="25R1y">
      <property role="3tVfz5" value="1624465643281312459" />
      <property role="TrG5h" value="true" />
      <property role="1L1pqM" value="high" />
    </node>
    <node concept="25R33" id="1qbgIlhAYFc" role="25R1y">
      <property role="3tVfz5" value="1624465643281312460" />
      <property role="TrG5h" value="false" />
      <property role="1L1pqM" value="low" />
    </node>
  </node>
  <node concept="1TIwiD" id="1qbgIlhAYFd">
    <property role="EcuMT" value="1624465643281312461" />
    <property role="TrG5h" value="Transition" />
    <ref role="1TJDcQ" to="tpck:gw2VY9q" resolve="BaseConcept" />
    <node concept="1TJgyi" id="1qbgIlhAYFe" role="1TKVEl">
      <property role="IQ2nx" value="1624465643281312462" />
      <property role="TrG5h" value="status" />
      <ref role="AX2Wp" node="1qbgIlhAYFa" resolve="STATUS" />
    </node>
    <node concept="1TJgyj" id="1qbgIlhAYFf" role="1TKVEi">
      <property role="IQ2ns" value="1624465643281312463" />
      <property role="20kJfa" value="sensor" />
      <property role="20lbJX" value="fLJekj4/_1" />
      <ref role="20lvS9" node="1qbgIlh$tWM" resolve="Sensor" />
    </node>
    <node concept="1TJgyj" id="1qbgIlhAYFg" role="1TKVEi">
      <property role="IQ2ns" value="1624465643281312464" />
      <property role="20kJfa" value="target" />
      <property role="20lbJX" value="fLJekj4/_1" />
      <ref role="20lvS9" node="1qbgIlhAYD2" resolve="State" />
    </node>
  </node>
  <node concept="1TIwiD" id="1qbgIlhAYFh">
    <property role="EcuMT" value="1624465643281312465" />
    <property role="TrG5h" value="Action" />
    <ref role="1TJDcQ" to="tpck:gw2VY9q" resolve="BaseConcept" />
    <node concept="1TJgyi" id="1qbgIlhAYFi" role="1TKVEl">
      <property role="IQ2nx" value="1624465643281312466" />
      <property role="TrG5h" value="status" />
      <ref role="AX2Wp" node="1qbgIlhAYFa" resolve="STATUS" />
    </node>
    <node concept="1TJgyj" id="1qbgIlhAYFj" role="1TKVEi">
      <property role="IQ2ns" value="1624465643281312467" />
      <property role="20kJfa" value="actuator" />
      <property role="20lbJX" value="fLJekj4/_1" />
      <ref role="20lvS9" node="1qbgIlh$tWL" resolve="Actuator" />
    </node>
  </node>
</model>

